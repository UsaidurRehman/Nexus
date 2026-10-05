using System.ComponentModel.DataAnnotations;

namespace Nexus.Api.Models.Dtos;

// ===================================================================
//  COMMON
// ===================================================================

/// <summary>Uniform envelope for list endpoints that support paging.</summary>
public class PagedResult<T>
{
    public IReadOnlyList<T> Items { get; init; } = Array.Empty<T>();
    public int Page { get; init; }
    public int PageSize { get; init; }
    public int TotalCount { get; init; }
    public int TotalPages => PageSize > 0 ? (int)Math.Ceiling(TotalCount / (double)PageSize) : 0;
    public bool HasPrevious => Page > 1;
    public bool HasNext => Page < TotalPages;
}

/// <summary>Query string contract for GET /api/v1/events.</summary>
public class EventQueryParameters
{
    /// <summary>Tier LEVEL (1,2,3) — not TierId.</summary>
    public byte? Tier { get; set; }
    public int? CategoryId { get; set; }
    public string? Category { get; set; }      // category slug
    public string? Search { get; set; }        // title / summary / description keyword
    public bool? Featured { get; set; }
    public decimal? MinFee { get; set; }
    public decimal? MaxFee { get; set; }
    public bool? IsActive { get; set; } = true;
    public int? TeamSize { get; set; }         // events that accept a team of this size

    /// <summary>title | fee | tier | created | order (default: order)</summary>
    public string? SortBy { get; set; }
    public bool Desc { get; set; }

    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 50;
}

// ===================================================================
//  TIER
// ===================================================================

public class TierDto
{
    public int TierId { get; set; }
    public byte TierLevel { get; set; }
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    public int DisplayOrder { get; set; }
    public int EventCount { get; set; }
}

public class TierSaveDto
{
    [Required, Range(1, 3)] public byte TierLevel { get; set; }
    [Required, MaxLength(100)] public string Name { get; set; } = null!;
    [MaxLength(300)] public string? Description { get; set; }
    public int DisplayOrder { get; set; }
}

// ===================================================================
//  CATEGORY
// ===================================================================

public class CategoryDto
{
    public int CategoryId { get; set; }
    public string Name { get; set; } = null!;
    public string Slug { get; set; } = null!;
    public string? IconName { get; set; }
    public int DisplayOrder { get; set; }
    public int EventCount { get; set; }
}

public class CategorySaveDto
{
    [Required, MaxLength(100)] public string Name { get; set; } = null!;
    /// <summary>Optional — generated from Name when omitted.</summary>
    [MaxLength(120)] public string? Slug { get; set; }
    [MaxLength(60)] public string? IconName { get; set; }
    public int DisplayOrder { get; set; }
}

// ===================================================================
//  COORDINATOR
// ===================================================================

public class CoordinatorDto
{
    public int CoordinatorId { get; set; }
    public int EventId { get; set; }
    public string? EventTitle { get; set; }
    public string FullName { get; set; } = null!;
    public string? Phone { get; set; }
    public string? Email { get; set; }
}

public class CoordinatorSaveDto
{
    [Required] public int EventId { get; set; }
    [Required, MaxLength(120)] public string FullName { get; set; } = null!;
    [MaxLength(30)] public string? Phone { get; set; }
    [EmailAddress, MaxLength(150)] public string? Email { get; set; }
}

// ===================================================================
//  RULE
// ===================================================================

public class RuleDto
{
    public int RuleId { get; set; }
    public string RuleText { get; set; } = null!;
    public int DisplayOrder { get; set; }
}

public class RuleSaveDto
{
    [Required, MaxLength(500)] public string RuleText { get; set; } = null!;
    public int DisplayOrder { get; set; }
}

// ===================================================================
//  EVENT — list projection (catalog cards)
// ===================================================================

public class EventListDto
{
    public int EventId { get; set; }
    public string Title { get; set; } = null!;
    public string Slug { get; set; } = null!;
    public string? ShortSummary { get; set; }
    public string? ImageUrl { get; set; }
    public string? DurationText { get; set; }

    public int TierId { get; set; }
    public byte TierLevel { get; set; }
    public string TierName { get; set; } = null!;

    public int? CategoryId { get; set; }
    public string? Category { get; set; }
    public string? CategorySlug { get; set; }

    public string? Venue { get; set; }

    public byte MinTeamSize { get; set; }
    public byte MaxTeamSize { get; set; }
    public decimal? EntryFee { get; set; }
    public string? PrizeInfo { get; set; }
    public string? PrizePool { get; set; }

    public bool IsFeatured { get; set; }
    public bool IsActive { get; set; }

    public int CoordinatorCount { get; set; }
}

// ===================================================================
//  EVENT — full detail
// ===================================================================

public class EventDetailDto : EventListDto
{
    public string? Description { get; set; }
    public int? VenueId { get; set; }
    public string? VenueBuilding { get; set; }
    public string? VenueMapUrl { get; set; }

    public string? TierDescription { get; set; }

    public string? ManagerName { get; set; }
    public string? ManagerEmail { get; set; }
    public string? ManagerPhone { get; set; }

    public string? WinnerPrize { get; set; }
    public string? RunnerUpPrize { get; set; }

    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }

    public List<RuleDto> Rules { get; set; } = new();
    public List<CoordinatorDto> Coordinators { get; set; } = new();
    public List<SlotDto> Slots { get; set; } = new();
}

public class SlotDto
{
    public int SlotId { get; set; }
    public byte DayNumber { get; set; }
    public string Title { get; set; } = null!;
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public string? Venue { get; set; }
    public string? Notes { get; set; }
}

// ===================================================================
//  EVENT — create / update
// ===================================================================

public class EventSaveDto
{
    [Required] public int TierId { get; set; }
    public int? CategoryId { get; set; }
    public int? VenueId { get; set; }

    [Required, MaxLength(200)] public string Title { get; set; } = null!;
    /// <summary>Optional — generated from Title when omitted.</summary>
    [MaxLength(220)] public string? Slug { get; set; }
    [MaxLength(300)] public string? ShortSummary { get; set; }
    public string? Description { get; set; }
    [MaxLength(500)] public string? ImageUrl { get; set; }
    [MaxLength(60)] public string? DurationText { get; set; }

    [Range(1, 255)] public byte MinTeamSize { get; set; } = 1;
    [Range(1, 255)] public byte MaxTeamSize { get; set; } = 1;

    [MaxLength(300)] public string? PrizeInfo { get; set; }
    [Range(0, 9999999)] public decimal? EntryFee { get; set; }

    public bool IsFeatured { get; set; }
    public bool IsActive { get; set; } = true;

    [MaxLength(120)] public string? ManagerName { get; set; }
    [EmailAddress, MaxLength(150)] public string? ManagerEmail { get; set; }
    [MaxLength(30)] public string? ManagerPhone { get; set; }
    [MaxLength(100)] public string? WinnerPrize { get; set; }
    [MaxLength(100)] public string? RunnerUpPrize { get; set; }
    [MaxLength(100)] public string? PrizePool { get; set; }

    /// <summary>Optional. When supplied, REPLACES the event's entire rule list.</summary>
    public List<RuleSaveDto>? Rules { get; set; }
}

// ===================================================================
//  FEST INFO / FAQ / TEAM / CONTACT
// ===================================================================

public class FestInfoDto
{
    public int FestInfoId { get; set; }
    public string Name { get; set; } = null!;
    public string? Tagline { get; set; }
    public string? Description { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public string? VenueSummary { get; set; }
    public string? LogoUrl { get; set; }
    public string? BannerUrl { get; set; }
    public string? ContactEmail { get; set; }
    public string? ContactPhone { get; set; }
    public string? InstagramUrl { get; set; }
    public string? LinkedInUrl { get; set; }
    public string? FacebookUrl { get; set; }
    public string? ExecutiveHead { get; set; }
    public int TotalEvents { get; set; }
    public int DurationDays { get; set; }
}

public class FaqDto
{
    public int FaqId { get; set; }
    public string Question { get; set; } = null!;
    public string Answer { get; set; } = null!;
    public int DisplayOrder { get; set; }
}

public class TeamMemberDto
{
    public int MemberId { get; set; }
    public string FullName { get; set; } = null!;
    public string Role { get; set; } = null!;
    public string? Department { get; set; }
    public string? PhotoUrl { get; set; }
    public string? LinkedInUrl { get; set; }
    public int DisplayOrder { get; set; }
}

public class ContactMessageCreateDto
{
    [Required, MaxLength(120)] public string FullName { get; set; } = null!;
    [Required, EmailAddress, MaxLength(150)] public string Email { get; set; } = null!;
    [MaxLength(200)] public string? Subject { get; set; }
    [Required, MaxLength(2000)] public string Message { get; set; } = null!;
    /// <summary>Honeypot. Must stay empty — bots fill it in.</summary>
    public string? Website { get; set; }
}

// ===================================================================
//  AUTH
// ===================================================================

public class LoginRequestDto
{
    [Required, MaxLength(60)] public string Username { get; set; } = null!;
    [Required, MaxLength(100)] public string Password { get; set; } = null!;
}

public class LoginResponseDto
{
    public string Token { get; set; } = null!;
    public string Username { get; set; } = null!;
    public string Role { get; set; } = null!;
    public DateTime ExpiresAt { get; set; }
}

// ===================================================================
//  DASHBOARD
// ===================================================================

public class DashboardStatsDto
{
    public int TotalEvents { get; set; }
    public int ActiveEvents { get; set; }
    public int FeaturedEvents { get; set; }
    public int TotalCategories { get; set; }
    public int TotalTiers { get; set; }
    public int TotalCoordinators { get; set; }
    public int EventsWithoutCoordinator { get; set; }
    public decimal? AverageEntryFee { get; set; }
    public List<TierBreakdownDto> ByTier { get; set; } = new();
    public List<CategoryBreakdownDto> ByCategory { get; set; } = new();
}

public class TierBreakdownDto
{
    public byte TierLevel { get; set; }
    public string TierName { get; set; } = null!;
    public int Count { get; set; }
}

public class CategoryBreakdownDto
{
    public string Category { get; set; } = null!;
    public int Count { get; set; }
}
