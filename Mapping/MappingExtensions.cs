using Nexus.Api.Models.Dtos;
using Nexus.Api.Models.Entities;

namespace Nexus.Api.Mapping;

/// <summary>
/// Hand-written entity to DTO projections. No AutoMapper: these are explicit,
/// debuggable and translate cleanly to SQL when used inside IQueryable.Select.
/// </summary>
public static class MappingExtensions
{
    public static EventListDto ToListDto(this Event e) => new()
    {
        EventId = e.EventId,
        Title = e.Title,
        Slug = e.Slug,
        ShortSummary = e.ShortSummary,
        ImageUrl = e.ImageUrl,
        DurationText = e.DurationText,
        TierId = e.TierId,
        TierLevel = e.Tier != null ? e.Tier.TierLevel : (byte)0,
        TierName = e.Tier != null ? e.Tier.Name : string.Empty,
        CategoryId = e.CategoryId,
        Category = e.Category != null ? e.Category.Name : null,
        CategorySlug = e.Category != null ? e.Category.Slug : null,
        Venue = e.Venue != null ? e.Venue.Name : null,
        MinTeamSize = e.MinTeamSize,
        MaxTeamSize = e.MaxTeamSize,
        EntryFee = e.EntryFee,
        PrizeInfo = e.PrizeInfo,
        PrizePool = e.PrizePool,
        IsFeatured = e.IsFeatured,
        IsActive = e.IsActive,
        CoordinatorCount = e.Coordinators != null ? e.Coordinators.Count : 0,
    };

    public static EventDetailDto ToDetailDto(this Event e) => new()
    {
        EventId = e.EventId,
        Title = e.Title,
        Slug = e.Slug,
        ShortSummary = e.ShortSummary,
        Description = e.Description,
        ImageUrl = e.ImageUrl,
        DurationText = e.DurationText,

        TierId = e.TierId,
        TierLevel = e.Tier != null ? e.Tier.TierLevel : (byte)0,
        TierName = e.Tier != null ? e.Tier.Name : string.Empty,
        TierDescription = e.Tier != null ? e.Tier.Description : null,

        CategoryId = e.CategoryId,
        Category = e.Category != null ? e.Category.Name : null,
        CategorySlug = e.Category != null ? e.Category.Slug : null,

        VenueId = e.VenueId,
        Venue = e.Venue != null ? e.Venue.Name : null,
        VenueBuilding = e.Venue != null ? e.Venue.Building : null,
        VenueMapUrl = e.Venue != null ? e.Venue.MapUrl : null,

        MinTeamSize = e.MinTeamSize,
        MaxTeamSize = e.MaxTeamSize,
        EntryFee = e.EntryFee,
        PrizeInfo = e.PrizeInfo,
        PrizePool = e.PrizePool,
        WinnerPrize = e.WinnerPrize,
        RunnerUpPrize = e.RunnerUpPrize,

        ManagerName = e.ManagerName,
        ManagerEmail = e.ManagerEmail,
        ManagerPhone = e.ManagerPhone,

        IsFeatured = e.IsFeatured,
        IsActive = e.IsActive,
        CreatedAt = e.CreatedAt,
        UpdatedAt = e.UpdatedAt,

        CoordinatorCount = e.Coordinators != null ? e.Coordinators.Count : 0,

        Rules = e.Rules == null
            ? new List<RuleDto>()
            : e.Rules.OrderBy(r => r.DisplayOrder).ThenBy(r => r.RuleId)
                     .Select(r => new RuleDto
                     {
                         RuleId = r.RuleId,
                         RuleText = r.RuleText,
                         DisplayOrder = r.DisplayOrder,
                     }).ToList(),

        Coordinators = e.Coordinators == null
            ? new List<CoordinatorDto>()
            : e.Coordinators.OrderBy(c => c.CoordinatorId)
                     .Select(c => new CoordinatorDto
                     {
                         CoordinatorId = c.CoordinatorId,
                         EventId = c.EventId,
                         FullName = c.FullName,
                         Phone = c.Phone,
                         Email = c.Email,
                     }).ToList(),

        Slots = e.ScheduleSlots == null
            ? new List<SlotDto>()
            : e.ScheduleSlots.OrderBy(s => s.DayNumber).ThenBy(s => s.StartTime)
                     .Select(s => new SlotDto
                     {
                         SlotId = s.SlotId,
                         DayNumber = s.DayNumber,
                         Title = s.Title,
                         StartTime = s.StartTime,
                         EndTime = s.EndTime,
                         Venue = s.Venue != null ? s.Venue.Name : null,
                         Notes = s.Notes,
                     }).ToList(),
    };

    public static CoordinatorDto ToDto(this EventCoordinator c) => new()
    {
        CoordinatorId = c.CoordinatorId,
        EventId = c.EventId,
        EventTitle = c.Event != null ? c.Event.Title : null,
        FullName = c.FullName,
        Phone = c.Phone,
        Email = c.Email,
    };

    public static TierDto ToDto(this EventTier t) => new()
    {
        TierId = t.TierId,
        TierLevel = t.TierLevel,
        Name = t.Name,
        Description = t.Description,
        DisplayOrder = t.DisplayOrder,
        EventCount = t.Events?.Count(e => e.IsActive) ?? 0,
    };

    public static CategoryDto ToDto(this EventCategory c) => new()
    {
        CategoryId = c.CategoryId,
        Name = c.Name,
        Slug = c.Slug,
        IconName = c.IconName,
        DisplayOrder = c.DisplayOrder,
        EventCount = c.Events?.Count(e => e.IsActive) ?? 0,
    };

    public static FaqDto ToDto(this Faq f) => new()
    {
        FaqId = f.FaqId,
        Question = f.Question,
        Answer = f.Answer,
        DisplayOrder = f.DisplayOrder,
    };

    public static TeamMemberDto ToDto(this TeamMember m) => new()
    {
        MemberId = m.MemberId,
        FullName = m.FullName,
        Role = m.Role,
        Department = m.Department,
        PhotoUrl = m.PhotoUrl,
        LinkedInUrl = m.LinkedInUrl,
        DisplayOrder = m.DisplayOrder,
    };
}
