using Microsoft.EntityFrameworkCore;
using Nexus.Api.Data;
using Nexus.Api.Helpers;
using Nexus.Api.Mapping;
using Nexus.Api.Models.Dtos;
using Nexus.Api.Models.Entities;
using Nexus.Api.Repositories;

namespace Nexus.Api.Services;

public class EventService : IEventService
{
    private readonly IEventRepository _repo;
    private readonly NexusDbContext _db;
    private readonly ILogger<EventService> _log;

    public EventService(IEventRepository repo, NexusDbContext db, ILogger<EventService> log)
    {
        _repo = repo;
        _db = db;
        _log = log;
    }

    public async Task<PagedResult<EventListDto>> GetEventsAsync(EventQueryParameters p, CancellationToken ct = default)
    {
        var (items, total) = await _repo.QueryAsync(p, ct);
        return new PagedResult<EventListDto>
        {
            Items = items.Select(e => e.ToListDto()).ToList(),
            Page = p.Page < 1 ? 1 : p.Page,
            PageSize = p.PageSize is < 1 or > 200 ? 50 : p.PageSize,
            TotalCount = total,
        };
    }

    public async Task<EventDetailDto> GetByIdAsync(int id, CancellationToken ct = default)
    {
        var entity = await _repo.GetByIdAsync(id, true, ct)
                     ?? throw ApiException.NotFound($"Event {id}");
        return entity.ToDetailDto();
    }

    public async Task<EventDetailDto> GetBySlugAsync(string slug, CancellationToken ct = default)
    {
        var entity = await _repo.GetBySlugAsync(slug, true, ct);

        // Fall back to a numeric id so stale/mistyped links still resolve.
        if (entity is null && int.TryParse(slug, out var id))
            entity = await _repo.GetByIdAsync(id, true, ct);

        if (entity is null) throw ApiException.NotFound($"Event '{slug}'");
        return entity.ToDetailDto();
    }

    public async Task<EventDetailDto> CreateAsync(EventSaveDto dto, CancellationToken ct = default)
    {
        await ValidateForeignKeysAsync(dto, ct);

        if (dto.MinTeamSize > dto.MaxTeamSize)
            throw ApiException.BadRequest("MinTeamSize cannot be greater than MaxTeamSize.");

        var slug = await EnsureUniqueSlugAsync(
            string.IsNullOrWhiteSpace(dto.Slug) ? SlugHelper.Generate(dto.Title) : SlugHelper.Generate(dto.Slug),
            null, ct);

        var entity = new Event
        {
            TierId = dto.TierId,
            CategoryId = dto.CategoryId,
            VenueId = dto.VenueId,
            Title = dto.Title.Trim(),
            Slug = slug,
            ShortSummary = dto.ShortSummary,
            Description = dto.Description,
            ImageUrl = dto.ImageUrl,
            DurationText = dto.DurationText,
            MinTeamSize = dto.MinTeamSize,
            MaxTeamSize = dto.MaxTeamSize,
            PrizeInfo = dto.PrizeInfo,
            EntryFee = dto.EntryFee,
            IsFeatured = dto.IsFeatured,
            IsActive = dto.IsActive,
            ManagerName = dto.ManagerName,
            ManagerEmail = dto.ManagerEmail,
            ManagerPhone = dto.ManagerPhone,
            WinnerPrize = dto.WinnerPrize,
            RunnerUpPrize = dto.RunnerUpPrize,
            PrizePool = dto.PrizePool,
            CreatedAt = DateTime.UtcNow,
        };

        if (dto.Rules is { Count: > 0 })
        {
            var order = 1;
            foreach (var r in dto.Rules.Where(r => !string.IsNullOrWhiteSpace(r.RuleText)))
            {
                entity.Rules.Add(new EventRule
                {
                    RuleText = r.RuleText.Trim(),
                    DisplayOrder = r.DisplayOrder > 0 ? r.DisplayOrder : order,
                });
                order++;
            }
        }

        await _repo.AddAsync(entity, ct);
        await _repo.SaveChangesAsync(ct);
        _log.LogInformation("Created event {EventId} ({Slug})", entity.EventId, entity.Slug);

        return await GetByIdAsync(entity.EventId, ct);
    }

    public async Task<EventDetailDto> UpdateAsync(int id, EventSaveDto dto, CancellationToken ct = default)
    {
        var entity = await _repo.GetByIdAsync(id, true, ct)
                     ?? throw ApiException.NotFound($"Event {id}");

        await ValidateForeignKeysAsync(dto, ct);

        if (dto.MinTeamSize > dto.MaxTeamSize)
            throw ApiException.BadRequest("MinTeamSize cannot be greater than MaxTeamSize.");

        var desiredSlug = string.IsNullOrWhiteSpace(dto.Slug)
            ? SlugHelper.Generate(dto.Title)
            : SlugHelper.Generate(dto.Slug);

        if (!string.Equals(desiredSlug, entity.Slug, StringComparison.OrdinalIgnoreCase))
            entity.Slug = await EnsureUniqueSlugAsync(desiredSlug, id, ct);

        entity.TierId = dto.TierId;
        entity.CategoryId = dto.CategoryId;
        entity.VenueId = dto.VenueId;
        entity.Title = dto.Title.Trim();
        entity.ShortSummary = dto.ShortSummary;
        entity.Description = dto.Description;
        entity.ImageUrl = dto.ImageUrl;
        entity.DurationText = dto.DurationText;
        entity.MinTeamSize = dto.MinTeamSize;
        entity.MaxTeamSize = dto.MaxTeamSize;
        entity.PrizeInfo = dto.PrizeInfo;
        entity.EntryFee = dto.EntryFee;
        entity.IsFeatured = dto.IsFeatured;
        entity.IsActive = dto.IsActive;
        entity.ManagerName = dto.ManagerName;
        entity.ManagerEmail = dto.ManagerEmail;
        entity.ManagerPhone = dto.ManagerPhone;
        entity.WinnerPrize = dto.WinnerPrize;
        entity.RunnerUpPrize = dto.RunnerUpPrize;
        entity.PrizePool = dto.PrizePool;
        entity.UpdatedAt = DateTime.UtcNow;

        // When Rules is supplied it REPLACES the whole list (documented contract).
        if (dto.Rules is not null)
        {
            _db.EventRules.RemoveRange(entity.Rules);
            entity.Rules.Clear();

            var order = 1;
            foreach (var r in dto.Rules.Where(r => !string.IsNullOrWhiteSpace(r.RuleText)))
            {
                entity.Rules.Add(new EventRule
                {
                    EventId = entity.EventId,
                    RuleText = r.RuleText.Trim(),
                    DisplayOrder = r.DisplayOrder > 0 ? r.DisplayOrder : order,
                });
                order++;
            }
        }

        await _repo.SaveChangesAsync(ct);
        _log.LogInformation("Updated event {EventId}", id);

        return await GetByIdAsync(id, ct);
    }

    /// <summary>
    /// Soft-delete by default (IsActive = 0), matching the "soft-hide" rule in
    /// the design document. hardDelete=true physically removes the row and
    /// cascades to rules/coordinators/slots.
    /// </summary>
    public async Task DeleteAsync(int id, bool hardDelete = false, CancellationToken ct = default)
    {
        var entity = await _repo.GetByIdAsync(id, false, ct)
                     ?? throw ApiException.NotFound($"Event {id}");

        if (hardDelete)
        {
            var hasRegistrations = await _db.Registrations.AnyAsync(r => r.EventId == id, ct);
            if (hasRegistrations)
                throw ApiException.Conflict(
                    "This event has registrations and cannot be permanently deleted. Deactivate it instead.");

            _repo.Remove(entity);
            _log.LogWarning("HARD deleted event {EventId}", id);
        }
        else
        {
            entity.IsActive = false;
            entity.UpdatedAt = DateTime.UtcNow;
            _log.LogInformation("Soft deleted event {EventId}", id);
        }

        await _repo.SaveChangesAsync(ct);
    }

    public async Task<DashboardStatsDto> GetDashboardStatsAsync(CancellationToken ct = default)
    {
        var stats = new DashboardStatsDto
        {
            TotalEvents = await _db.Events.CountAsync(ct),
            ActiveEvents = await _db.Events.CountAsync(e => e.IsActive, ct),
            FeaturedEvents = await _db.Events.CountAsync(e => e.IsFeatured && e.IsActive, ct),
            TotalCategories = await _db.EventCategories.CountAsync(ct),
            TotalTiers = await _db.EventTiers.CountAsync(ct),
            TotalCoordinators = await _db.EventCoordinators.CountAsync(ct),
            EventsWithoutCoordinator = await _db.Events.CountAsync(e => e.IsActive && !e.Coordinators.Any(), ct),
            AverageEntryFee = await _db.Events.Where(e => e.IsActive && e.EntryFee != null)
                                              .AverageAsync(e => (decimal?)e.EntryFee, ct),
        };

        stats.ByTier = await _db.EventTiers
            .OrderBy(t => t.DisplayOrder)
            .Select(t => new TierBreakdownDto
            {
                TierLevel = t.TierLevel,
                TierName = t.Name,
                Count = t.Events.Count(e => e.IsActive),
            })
            .ToListAsync(ct);

        stats.ByCategory = await _db.EventCategories
            .OrderBy(c => c.DisplayOrder)
            .Select(c => new CategoryBreakdownDto
            {
                Category = c.Name,
                Count = c.Events.Count(e => e.IsActive),
            })
            .ToListAsync(ct);

        return stats;
    }

    // ------------------------------------------------------------------
    // helpers
    // ------------------------------------------------------------------

    private async Task ValidateForeignKeysAsync(EventSaveDto dto, CancellationToken ct)
    {
        if (!await _db.EventTiers.AnyAsync(t => t.TierId == dto.TierId, ct))
            throw ApiException.BadRequest($"TierId {dto.TierId} does not exist.");

        if (dto.CategoryId.HasValue &&
            !await _db.EventCategories.AnyAsync(c => c.CategoryId == dto.CategoryId.Value, ct))
            throw ApiException.BadRequest($"CategoryId {dto.CategoryId} does not exist.");

        if (dto.VenueId.HasValue &&
            !await _db.Venues.AnyAsync(v => v.VenueId == dto.VenueId.Value, ct))
            throw ApiException.BadRequest($"VenueId {dto.VenueId} does not exist.");
    }

    /// <summary>Appends -2, -3 ... until the slug is free.</summary>
    private async Task<string> EnsureUniqueSlugAsync(string baseSlug, int? excludeId, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(baseSlug))
            throw ApiException.BadRequest("A slug could not be generated from the title.");

        var candidate = baseSlug;
        var suffix = 2;

        while (await _repo.SlugExistsAsync(candidate, excludeId, ct))
        {
            candidate = $"{baseSlug}-{suffix}";
            suffix++;
            if (suffix > 200) throw ApiException.Conflict("Unable to generate a unique slug.");
        }

        return candidate;
    }
}
