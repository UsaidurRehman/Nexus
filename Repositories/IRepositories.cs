using Nexus.Api.Models.Dtos;
using Nexus.Api.Models.Entities;

namespace Nexus.Api.Repositories;

public interface IEventRepository
{
    Task<(List<Event> Items, int TotalCount)> QueryAsync(EventQueryParameters p, CancellationToken ct = default);
    Task<Event?> GetByIdAsync(int id, bool includeDetails = true, CancellationToken ct = default);
    Task<Event?> GetBySlugAsync(string slug, bool includeDetails = true, CancellationToken ct = default);
    Task<bool> SlugExistsAsync(string slug, int? excludeEventId = null, CancellationToken ct = default);
    Task AddAsync(Event entity, CancellationToken ct = default);
    void Update(Event entity);
    void Remove(Event entity);
    Task<int> SaveChangesAsync(CancellationToken ct = default);
}

public interface ITierRepository
{
    Task<List<EventTier>> GetAllAsync(CancellationToken ct = default);
    Task<EventTier?> GetByIdAsync(int id, CancellationToken ct = default);
    Task<EventTier?> GetByLevelAsync(byte level, CancellationToken ct = default);
    Task<bool> LevelExistsAsync(byte level, int? excludeTierId = null, CancellationToken ct = default);
    Task AddAsync(EventTier entity, CancellationToken ct = default);
    void Remove(EventTier entity);
    Task<int> SaveChangesAsync(CancellationToken ct = default);
}

public interface ICategoryRepository
{
    Task<List<EventCategory>> GetAllAsync(CancellationToken ct = default);
    Task<EventCategory?> GetByIdAsync(int id, CancellationToken ct = default);
    Task<EventCategory?> GetBySlugAsync(string slug, CancellationToken ct = default);
    Task<bool> SlugExistsAsync(string slug, int? excludeId = null, CancellationToken ct = default);
    Task AddAsync(EventCategory entity, CancellationToken ct = default);
    void Remove(EventCategory entity);
    Task<int> SaveChangesAsync(CancellationToken ct = default);
}

public interface ICoordinatorRepository
{
    Task<List<EventCoordinator>> GetAllAsync(int? eventId = null, CancellationToken ct = default);
    Task<EventCoordinator?> GetByIdAsync(int id, CancellationToken ct = default);
    Task<bool> ExistsForEventAsync(int eventId, string fullName, int? excludeId = null, CancellationToken ct = default);
    Task AddAsync(EventCoordinator entity, CancellationToken ct = default);
    void Remove(EventCoordinator entity);
    Task<int> SaveChangesAsync(CancellationToken ct = default);
}
