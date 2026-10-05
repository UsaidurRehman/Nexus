using Microsoft.EntityFrameworkCore;
using Nexus.Api.Data;
using Nexus.Api.Helpers;
using Nexus.Api.Mapping;
using Nexus.Api.Models.Dtos;
using Nexus.Api.Models.Entities;
using Nexus.Api.Repositories;

namespace Nexus.Api.Services;

public class TierService : ITierService
{
    private readonly ITierRepository _repo;
    public TierService(ITierRepository repo) => _repo = repo;

    public async Task<List<TierDto>> GetAllAsync(CancellationToken ct = default) =>
        (await _repo.GetAllAsync(ct)).Select(t => t.ToDto()).ToList();

    public async Task<TierDto> GetByIdAsync(int id, CancellationToken ct = default)
    {
        var t = await _repo.GetByIdAsync(id, ct) ?? throw ApiException.NotFound($"Tier {id}");
        return t.ToDto();
    }

    public async Task<TierDto> CreateAsync(TierSaveDto dto, CancellationToken ct = default)
    {
        if (await _repo.LevelExistsAsync(dto.TierLevel, null, ct))
            throw ApiException.Conflict($"Tier level {dto.TierLevel} already exists.");

        var entity = new EventTier
        {
            TierLevel = dto.TierLevel,
            Name = dto.Name.Trim(),
            Description = dto.Description,
            DisplayOrder = dto.DisplayOrder > 0 ? dto.DisplayOrder : dto.TierLevel,
        };

        await _repo.AddAsync(entity, ct);
        await _repo.SaveChangesAsync(ct);
        return entity.ToDto();
    }

    public async Task<TierDto> UpdateAsync(int id, TierSaveDto dto, CancellationToken ct = default)
    {
        var entity = await _repo.GetByIdAsync(id, ct) ?? throw ApiException.NotFound($"Tier {id}");

        if (await _repo.LevelExistsAsync(dto.TierLevel, id, ct))
            throw ApiException.Conflict($"Tier level {dto.TierLevel} is already used by another tier.");

        entity.TierLevel = dto.TierLevel;
        entity.Name = dto.Name.Trim();
        entity.Description = dto.Description;
        entity.DisplayOrder = dto.DisplayOrder;

        await _repo.SaveChangesAsync(ct);
        return entity.ToDto();
    }

    public async Task DeleteAsync(int id, CancellationToken ct = default)
    {
        var entity = await _repo.GetByIdAsync(id, ct) ?? throw ApiException.NotFound($"Tier {id}");

        if (entity.Events.Any())
            throw ApiException.Conflict(
                $"Tier '{entity.Name}' still has {entity.Events.Count} event(s). Reassign them first.");

        _repo.Remove(entity);
        await _repo.SaveChangesAsync(ct);
    }
}

public class CategoryService : ICategoryService
{
    private readonly ICategoryRepository _repo;
    public CategoryService(ICategoryRepository repo) => _repo = repo;

    public async Task<List<CategoryDto>> GetAllAsync(CancellationToken ct = default) =>
        (await _repo.GetAllAsync(ct)).Select(c => c.ToDto()).ToList();

    public async Task<CategoryDto> GetByIdAsync(int id, CancellationToken ct = default)
    {
        var c = await _repo.GetByIdAsync(id, ct) ?? throw ApiException.NotFound($"Category {id}");
        return c.ToDto();
    }

    public async Task<CategoryDto> CreateAsync(CategorySaveDto dto, CancellationToken ct = default)
    {
        var slug = SlugHelper.Generate(string.IsNullOrWhiteSpace(dto.Slug) ? dto.Name : dto.Slug);

        if (await _repo.SlugExistsAsync(slug, null, ct))
            throw ApiException.Conflict($"A category with slug '{slug}' already exists.");

        var entity = new EventCategory
        {
            Name = dto.Name.Trim(),
            Slug = slug,
            IconName = dto.IconName,
            DisplayOrder = dto.DisplayOrder,
        };

        await _repo.AddAsync(entity, ct);
        await _repo.SaveChangesAsync(ct);
        return entity.ToDto();
    }

    public async Task<CategoryDto> UpdateAsync(int id, CategorySaveDto dto, CancellationToken ct = default)
    {
        var entity = await _repo.GetByIdAsync(id, ct) ?? throw ApiException.NotFound($"Category {id}");

        var slug = SlugHelper.Generate(string.IsNullOrWhiteSpace(dto.Slug) ? dto.Name : dto.Slug);
        if (await _repo.SlugExistsAsync(slug, id, ct))
            throw ApiException.Conflict($"A category with slug '{slug}' already exists.");

        entity.Name = dto.Name.Trim();
        entity.Slug = slug;
        entity.IconName = dto.IconName;
        entity.DisplayOrder = dto.DisplayOrder;

        await _repo.SaveChangesAsync(ct);
        return entity.ToDto();
    }

    public async Task DeleteAsync(int id, CancellationToken ct = default)
    {
        var entity = await _repo.GetByIdAsync(id, ct) ?? throw ApiException.NotFound($"Category {id}");

        if (entity.Events.Any())
            throw ApiException.Conflict(
                $"Category '{entity.Name}' still has {entity.Events.Count} event(s). Reassign them first.");

        _repo.Remove(entity);
        await _repo.SaveChangesAsync(ct);
    }
}

public class CoordinatorService : ICoordinatorService
{
    private readonly ICoordinatorRepository _repo;
    private readonly NexusDbContext _db;

    public CoordinatorService(ICoordinatorRepository repo, NexusDbContext db)
    {
        _repo = repo;
        _db = db;
    }

    public async Task<List<CoordinatorDto>> GetAllAsync(int? eventId, CancellationToken ct = default) =>
        (await _repo.GetAllAsync(eventId, ct)).Select(c => c.ToDto()).ToList();

    public async Task<CoordinatorDto> GetByIdAsync(int id, CancellationToken ct = default)
    {
        var c = await _repo.GetByIdAsync(id, ct) ?? throw ApiException.NotFound($"Coordinator {id}");
        return c.ToDto();
    }

    public async Task<CoordinatorDto> CreateAsync(CoordinatorSaveDto dto, CancellationToken ct = default)
    {
        if (!await _db.Events.AnyAsync(e => e.EventId == dto.EventId, ct))
            throw ApiException.BadRequest($"EventId {dto.EventId} does not exist.");

        var name = dto.FullName.Trim();

        // Guards against the duplicate-coordinator bug in the original seed script.
        if (await _repo.ExistsForEventAsync(dto.EventId, name, null, ct))
            throw ApiException.Conflict($"'{name}' is already a coordinator for this event.");

        var entity = new EventCoordinator
        {
            EventId = dto.EventId,
            FullName = name,
            Phone = NormalisePhone(dto.Phone),
            Email = dto.Email?.Trim(),
        };

        await _repo.AddAsync(entity, ct);
        await _repo.SaveChangesAsync(ct);

        return (await _repo.GetByIdAsync(entity.CoordinatorId, ct))!.ToDto();
    }

    public async Task<CoordinatorDto> UpdateAsync(int id, CoordinatorSaveDto dto, CancellationToken ct = default)
    {
        var entity = await _repo.GetByIdAsync(id, ct) ?? throw ApiException.NotFound($"Coordinator {id}");

        if (!await _db.Events.AnyAsync(e => e.EventId == dto.EventId, ct))
            throw ApiException.BadRequest($"EventId {dto.EventId} does not exist.");

        var name = dto.FullName.Trim();
        if (await _repo.ExistsForEventAsync(dto.EventId, name, id, ct))
            throw ApiException.Conflict($"'{name}' is already a coordinator for this event.");

        entity.EventId = dto.EventId;
        entity.FullName = name;
        entity.Phone = NormalisePhone(dto.Phone);
        entity.Email = dto.Email?.Trim();

        await _repo.SaveChangesAsync(ct);
        return (await _repo.GetByIdAsync(id, ct))!.ToDto();
    }

    public async Task DeleteAsync(int id, CancellationToken ct = default)
    {
        var entity = await _repo.GetByIdAsync(id, ct) ?? throw ApiException.NotFound($"Coordinator {id}");
        _repo.Remove(entity);
        await _repo.SaveChangesAsync(ct);
    }

    /// <summary>
    /// The seed data mixes "03165621069" and "+92 316 5621069" for the same
    /// person. Normalise to a single local 03XXXXXXXXX form on write.
    /// </summary>
    private static string? NormalisePhone(string? phone)
    {
        if (string.IsNullOrWhiteSpace(phone)) return null;

        var digits = new string(phone.Where(char.IsDigit).ToArray());

        if (digits.StartsWith("92") && digits.Length == 12) digits = "0" + digits[2..];
        else if (digits.StartsWith("092") && digits.Length == 13) digits = "0" + digits[3..];

        return digits.Length is 11 ? digits : phone.Trim();
    }
}

public class ContentService : IContentService
{
    private readonly NexusDbContext _db;
    public ContentService(NexusDbContext db) => _db = db;

    public async Task<FestInfoDto?> GetFestInfoAsync(CancellationToken ct = default)
    {
        var f = await _db.FestInfo.AsNoTracking().OrderBy(x => x.FestInfoId).FirstOrDefaultAsync(ct);
        if (f is null) return null;

        return new FestInfoDto
        {
            FestInfoId = f.FestInfoId,
            Name = f.Name,
            Tagline = f.Tagline,
            Description = f.Description,
            StartDate = f.StartDate,
            EndDate = f.EndDate,
            VenueSummary = f.VenueSummary,
            LogoUrl = f.LogoUrl,
            BannerUrl = f.BannerUrl,
            ContactEmail = f.ContactEmail,
            ContactPhone = f.ContactPhone,
            InstagramUrl = f.InstagramUrl,
            LinkedInUrl = f.LinkedInUrl,
            FacebookUrl = f.FacebookUrl,
            ExecutiveHead = f.ExecutiveHead,
            TotalEvents = await _db.Events.CountAsync(e => e.IsActive, ct),
            DurationDays = (int)Math.Max(1, (f.EndDate.Date - f.StartDate.Date).TotalDays + 1),
        };
    }

    public async Task<List<FaqDto>> GetFaqsAsync(CancellationToken ct = default) =>
        (await _db.Faqs.AsNoTracking().OrderBy(f => f.DisplayOrder).ToListAsync(ct))
            .Select(f => f.ToDto()).ToList();

    public async Task<List<TeamMemberDto>> GetTeamAsync(CancellationToken ct = default) =>
        (await _db.TeamMembers.AsNoTracking().OrderBy(m => m.DisplayOrder).ToListAsync(ct))
            .Select(m => m.ToDto()).ToList();

    public async Task<int> SubmitContactMessageAsync(ContactMessageCreateDto dto, string? ip, CancellationToken ct = default)
    {
        // Honeypot: a filled "Website" field means a bot. Pretend success.
        if (!string.IsNullOrWhiteSpace(dto.Website)) return 0;

        var entity = new ContactMessage
        {
            FullName = dto.FullName.Trim(),
            Email = dto.Email.Trim(),
            Subject = dto.Subject?.Trim(),
            Message = dto.Message.Trim(),
            IpAddress = ip,
            CreatedAt = DateTime.UtcNow,
            IsRead = false,
        };

        _db.ContactMessages.Add(entity);
        await _db.SaveChangesAsync(ct);
        return entity.MessageId;
    }
}
