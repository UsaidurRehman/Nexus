using Microsoft.EntityFrameworkCore;
using Nexus.Api.Data;
using Nexus.Api.Models.Dtos;
using Nexus.Api.Models.Entities;

namespace Nexus.Api.Repositories;

public class EventRepository : IEventRepository
{
    private readonly NexusDbContext _db;
    public EventRepository(NexusDbContext db) => _db = db;

    /// <summary>
    /// Composable filter pipeline backing GET /api/v1/events.
    /// Every predicate is applied server-side; nothing is materialised early.
    /// </summary>
    public async Task<(List<Event> Items, int TotalCount)> QueryAsync(
        EventQueryParameters p, CancellationToken ct = default)
    {
        IQueryable<Event> q = _db.Events
            .AsNoTracking()
            .Include(e => e.Tier)
            .Include(e => e.Category)
            .Include(e => e.Venue)
            .Include(e => e.Coordinators);

        // --- IsActive (defaults to true so the public catalog never leaks drafts) ---
        if (p.IsActive.HasValue)
            q = q.Where(e => e.IsActive == p.IsActive.Value);

        // --- Tier (by LEVEL 1/2/3) ---
        if (p.Tier.HasValue)
            q = q.Where(e => e.Tier.TierLevel == p.Tier.Value);

        // --- Category by id or slug ---
        if (p.CategoryId.HasValue)
            q = q.Where(e => e.CategoryId == p.CategoryId.Value);

        if (!string.IsNullOrWhiteSpace(p.Category))
        {
            var slug = p.Category.Trim().ToLower();
            q = q.Where(e => e.Category != null && e.Category.Slug.ToLower() == slug);
        }

        // --- Featured ---
        if (p.Featured.HasValue)
            q = q.Where(e => e.IsFeatured == p.Featured.Value);

        // --- Fee range (NULL fee is treated as 0 / free) ---
        if (p.MinFee.HasValue)
            q = q.Where(e => (e.EntryFee ?? 0m) >= p.MinFee.Value);

        if (p.MaxFee.HasValue)
            q = q.Where(e => (e.EntryFee ?? 0m) <= p.MaxFee.Value);

        // --- Team size: events that can accommodate a team of N ---
        if (p.TeamSize.HasValue)
        {
            var n = p.TeamSize.Value;
            q = q.Where(e => e.MinTeamSize <= n && e.MaxTeamSize >= n);
        }

        // --- Keyword across title / summary / description / category ---
        if (!string.IsNullOrWhiteSpace(p.Search))
        {
            var term = p.Search.Trim();
            q = q.Where(e =>
                EF.Functions.Like(e.Title, $"%{term}%") ||
                (e.ShortSummary != null && EF.Functions.Like(e.ShortSummary, $"%{term}%")) ||
                (e.Description != null && EF.Functions.Like(e.Description, $"%{term}%")) ||
                (e.Category != null && EF.Functions.Like(e.Category.Name, $"%{term}%")));
        }

        // Count BEFORE paging.
        var total = await q.CountAsync(ct);

        // --- Sorting ---
        q = (p.SortBy?.ToLowerInvariant()) switch
        {
            "title"   => p.Desc ? q.OrderByDescending(e => e.Title)     : q.OrderBy(e => e.Title),
            "fee"     => p.Desc ? q.OrderByDescending(e => e.EntryFee)  : q.OrderBy(e => e.EntryFee),
            "tier"    => p.Desc ? q.OrderByDescending(e => e.Tier.TierLevel).ThenBy(e => e.Title)
                                : q.OrderBy(e => e.Tier.TierLevel).ThenBy(e => e.Title),
            "created" => p.Desc ? q.OrderByDescending(e => e.CreatedAt) : q.OrderBy(e => e.CreatedAt),
            _         => q.OrderBy(e => e.Tier.DisplayOrder)
                          .ThenByDescending(e => e.IsFeatured)
                          .ThenBy(e => e.Title),
        };

        // --- Paging ---
        var page = p.Page < 1 ? 1 : p.Page;
        var size = p.PageSize is < 1 or > 200 ? 50 : p.PageSize;

        var items = await q.Skip((page - 1) * size).Take(size).ToListAsync(ct);
        return (items, total);
    }

    public Task<Event?> GetByIdAsync(int id, bool includeDetails = true, CancellationToken ct = default) =>
        BaseQuery(includeDetails).FirstOrDefaultAsync(e => e.EventId == id, ct);

    public Task<Event?> GetBySlugAsync(string slug, bool includeDetails = true, CancellationToken ct = default) =>
        BaseQuery(includeDetails).FirstOrDefaultAsync(e => e.Slug == slug, ct);

    private IQueryable<Event> BaseQuery(bool includeDetails)
    {
        IQueryable<Event> q = _db.Events
            .Include(e => e.Tier)
            .Include(e => e.Category)
            .Include(e => e.Venue);

        if (includeDetails)
        {
            q = q.Include(e => e.Rules)
                 .Include(e => e.Coordinators)
                 .Include(e => e.ScheduleSlots).ThenInclude(s => s.Venue);
        }

        return q;
    }

    public Task<bool> SlugExistsAsync(string slug, int? excludeEventId = null, CancellationToken ct = default) =>
        _db.Events.AnyAsync(e => e.Slug == slug && (!excludeEventId.HasValue || e.EventId != excludeEventId.Value), ct);

    public async Task AddAsync(Event entity, CancellationToken ct = default) =>
        await _db.Events.AddAsync(entity, ct);

    public void Update(Event entity) => _db.Events.Update(entity);
    public void Remove(Event entity) => _db.Events.Remove(entity);
    public Task<int> SaveChangesAsync(CancellationToken ct = default) => _db.SaveChangesAsync(ct);
}
