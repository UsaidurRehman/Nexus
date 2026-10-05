using Nexus.Api.Models.Dtos;

namespace Nexus.Api.Services;

public interface IEventService
{
    Task<PagedResult<EventListDto>> GetEventsAsync(EventQueryParameters p, CancellationToken ct = default);
    Task<EventDetailDto> GetByIdAsync(int id, CancellationToken ct = default);
    Task<EventDetailDto> GetBySlugAsync(string slug, CancellationToken ct = default);
    Task<EventDetailDto> CreateAsync(EventSaveDto dto, CancellationToken ct = default);
    Task<EventDetailDto> UpdateAsync(int id, EventSaveDto dto, CancellationToken ct = default);
    Task DeleteAsync(int id, bool hardDelete = false, CancellationToken ct = default);
    Task<DashboardStatsDto> GetDashboardStatsAsync(CancellationToken ct = default);
}

public interface ITierService
{
    Task<List<TierDto>> GetAllAsync(CancellationToken ct = default);
    Task<TierDto> GetByIdAsync(int id, CancellationToken ct = default);
    Task<TierDto> CreateAsync(TierSaveDto dto, CancellationToken ct = default);
    Task<TierDto> UpdateAsync(int id, TierSaveDto dto, CancellationToken ct = default);
    Task DeleteAsync(int id, CancellationToken ct = default);
}

public interface ICategoryService
{
    Task<List<CategoryDto>> GetAllAsync(CancellationToken ct = default);
    Task<CategoryDto> GetByIdAsync(int id, CancellationToken ct = default);
    Task<CategoryDto> CreateAsync(CategorySaveDto dto, CancellationToken ct = default);
    Task<CategoryDto> UpdateAsync(int id, CategorySaveDto dto, CancellationToken ct = default);
    Task DeleteAsync(int id, CancellationToken ct = default);
}

public interface ICoordinatorService
{
    Task<List<CoordinatorDto>> GetAllAsync(int? eventId, CancellationToken ct = default);
    Task<CoordinatorDto> GetByIdAsync(int id, CancellationToken ct = default);
    Task<CoordinatorDto> CreateAsync(CoordinatorSaveDto dto, CancellationToken ct = default);
    Task<CoordinatorDto> UpdateAsync(int id, CoordinatorSaveDto dto, CancellationToken ct = default);
    Task DeleteAsync(int id, CancellationToken ct = default);
}

public interface IContentService
{
    Task<FestInfoDto?> GetFestInfoAsync(CancellationToken ct = default);
    Task<List<FaqDto>> GetFaqsAsync(CancellationToken ct = default);
    Task<List<TeamMemberDto>> GetTeamAsync(CancellationToken ct = default);
    Task<int> SubmitContactMessageAsync(ContactMessageCreateDto dto, string? ip, CancellationToken ct = default);
}

public interface IAuthService
{
    Task<LoginResponseDto> LoginAsync(LoginRequestDto dto, CancellationToken ct = default);
}
