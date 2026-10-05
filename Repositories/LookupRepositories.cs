using Microsoft.EntityFrameworkCore;
using Nexus.Api.Data;
using Nexus.Api.Models.Entities;

namespace Nexus.Api.Repositories;

public class TierRepository : ITierRepository
{
    private readonly NexusDbContext _db;
    public TierRepository(NexusDbContext db) => _db = db;

    public Task<List<EventTier>> GetAllAsync(CancellationToken ct = default) =>
        _db.EventTiers
           .AsNoTracking()
           .Include(t => t.Events)
           .OrderBy(t => t.DisplayOrder).ThenBy(t => t.TierLevel)
           .ToListAsync(ct);

    public Task<EventTier?> GetByIdAsync(int id, CancellationToken ct = default) =>
        _db.EventTiers.Include(t => t.Events).FirstOrDefaultAsync(t => t.TierId == id, ct);

    public Task<EventTier?> GetByLevelAsync(byte level, CancellationToken ct = default) =>
        _db.EventTiers.Include(t => t.Events).FirstOrDefaultAsync(t => t.TierLevel == level, ct);

    public Task<bool> LevelExistsAsync(byte level, int? excludeTierId = null, CancellationToken ct = default) =>
        _db.EventTiers.AnyAsync(t => t.TierLevel == level &&
            (!excludeTierId.HasValue || t.TierId != excludeTierId.Value), ct);

    public async Task AddAsync(EventTier entity, CancellationToken ct = default) =>
        await _db.EventTiers.AddAsync(entity, ct);

    public void Remove(EventTier entity) => _db.EventTiers.Remove(entity);
    public Task<int> SaveChangesAsync(CancellationToken ct = default) => _db.SaveChangesAsync(ct);
}

public class CategoryRepository : ICategoryRepository
{
    private readonly NexusDbContext _db;
    public CategoryRepository(NexusDbContext db) => _db = db;

    public Task<List<EventCategory>> GetAllAsync(CancellationToken ct = default) =>
        _db.EventCategories
           .AsNoTracking()
           .Include(c => c.Events)
           .OrderBy(c => c.DisplayOrder).ThenBy(c => c.Name)
           .ToListAsync(ct);

    public Task<EventCategory?> GetByIdAsync(int id, CancellationToken ct = default) =>
        _db.EventCategories.Include(c => c.Events).FirstOrDefaultAsync(c => c.CategoryId == id, ct);

    public Task<EventCategory?> GetBySlugAsync(string slug, CancellationToken ct = default) =>
        _db.EventCategories.Include(c => c.Events).FirstOrDefaultAsync(c => c.Slug == slug, ct);

    public Task<bool> SlugExistsAsync(string slug, int? excludeId = null, CancellationToken ct = default) =>
        _db.EventCategories.AnyAsync(c => c.Slug == slug &&
            (!excludeId.HasValue || c.CategoryId != excludeId.Value), ct);

    public async Task AddAsync(EventCategory entity, CancellationToken ct = default) =>
        await _db.EventCategories.AddAsync(entity, ct);

    public void Remove(EventCategory entity) => _db.EventCategories.Remove(entity);
    public Task<int> SaveChangesAsync(CancellationToken ct = default) => _db.SaveChangesAsync(ct);
}

public class CoordinatorRepository : ICoordinatorRepository
{
    private readonly NexusDbContext _db;
    public CoordinatorRepository(NexusDbContext db) => _db = db;

    public Task<List<EventCoordinator>> GetAllAsync(int? eventId = null, CancellationToken ct = default)
    {
        IQueryable<EventCoordinator> q = _db.EventCoordinators.AsNoTracking().Include(c => c.Event);
        if (eventId.HasValue) q = q.Where(c => c.EventId == eventId.Value);
        return q.OrderBy(c => c.Event.Title).ThenBy(c => c.FullName).ToListAsync(ct);
    }

    public Task<EventCoordinator?> GetByIdAsync(int id, CancellationToken ct = default) =>
        _db.EventCoordinators.Include(c => c.Event).FirstOrDefaultAsync(c => c.CoordinatorId == id, ct);

    public Task<bool> ExistsForEventAsync(int eventId, string fullName, int? excludeId = null, CancellationToken ct = default) =>
        _db.EventCoordinators.AnyAsync(c =>
            c.EventId == eventId &&
            c.FullName == fullName &&
            (!excludeId.HasValue || c.CoordinatorId != excludeId.Value), ct);

    public async Task AddAsync(EventCoordinator entity, CancellationToken ct = default) =>
        await _db.EventCoordinators.AddAsync(entity, ct);

    public void Remove(EventCoordinator entity) => _db.EventCoordinators.Remove(entity);
    public Task<int> SaveChangesAsync(CancellationToken ct = default) => _db.SaveChangesAsync(ct);
}
