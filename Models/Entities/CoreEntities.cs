using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Nexus.Api.Models.Entities;

/// <summary>Single-row table holding fest-level information (FestInfo).</summary>
public class FestInfo
{
    public int FestInfoId { get; set; }

    [Required, MaxLength(150)] public string Name { get; set; } = null!;
    [MaxLength(250)] public string? Tagline { get; set; }
    public string? Description { get; set; }

    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }

    [MaxLength(250)] public string? VenueSummary { get; set; }
    [MaxLength(500)] public string? LogoUrl { get; set; }
    [MaxLength(500)] public string? BannerUrl { get; set; }
    [MaxLength(150)] public string? ContactEmail { get; set; }
    [MaxLength(30)]  public string? ContactPhone { get; set; }
    [MaxLength(300)] public string? InstagramUrl { get; set; }
    [MaxLength(300)] public string? LinkedInUrl { get; set; }
    [MaxLength(300)] public string? FacebookUrl { get; set; }

    /// <summary>Added by ALTER TABLE in the supplied script.</summary>
    [MaxLength(120)] public string? ExecutiveHead { get; set; }
}

/// <summary>The three event tiers (1 = Flag-Ship, 2 = Mid-level, 3 = Internal).</summary>
public class EventTier
{
    public int TierId { get; set; }
    public byte TierLevel { get; set; }
    [Required, MaxLength(100)] public string Name { get; set; } = null!;
    [MaxLength(300)] public string? Description { get; set; }
    public int DisplayOrder { get; set; }

    public ICollection<Event> Events { get; set; } = new List<Event>();
}

/// <summary>Event category / track (Programming, AI &amp; Security, Sports...).</summary>
public class EventCategory
{
    public int CategoryId { get; set; }
    [Required, MaxLength(100)] public string Name { get; set; } = null!;
    [Required, MaxLength(120)] public string Slug { get; set; } = null!;
    [MaxLength(60)] public string? IconName { get; set; }
    public int DisplayOrder { get; set; }

    public ICollection<Event> Events { get; set; } = new List<Event>();
}

public class Venue
{
    public int VenueId { get; set; }
    [Required, MaxLength(150)] public string Name { get; set; } = null!;
    [MaxLength(150)] public string? Building { get; set; }
    public int? Capacity { get; set; }
    [MaxLength(500)] public string? MapUrl { get; set; }
    [MaxLength(500)] public string? Notes { get; set; }

    public ICollection<Event> Events { get; set; } = new List<Event>();
    public ICollection<ScheduleSlot> ScheduleSlots { get; set; } = new List<ScheduleSlot>();
}

/// <summary>Main competition entity.</summary>
public class Event
{
    public int EventId { get; set; }

    public int TierId { get; set; }
    public int? CategoryId { get; set; }
    public int? VenueId { get; set; }

    [Required, MaxLength(200)] public string Title { get; set; } = null!;
    [Required, MaxLength(220)] public string Slug { get; set; } = null!;
    [MaxLength(300)] public string? ShortSummary { get; set; }
    public string? Description { get; set; }
    [MaxLength(500)] public string? ImageUrl { get; set; }
    [MaxLength(60)]  public string? DurationText { get; set; }

    public byte MinTeamSize { get; set; } = 1;
    public byte MaxTeamSize { get; set; } = 1;

    [MaxLength(300)] public string? PrizeInfo { get; set; }

    [Column(TypeName = "decimal(10,2)")]
    public decimal? EntryFee { get; set; }

    public bool IsFeatured { get; set; }
    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }

    // ---- Columns added by ALTER TABLE in the supplied script ----
    [MaxLength(120)] public string? ManagerName { get; set; }
    [MaxLength(150)] public string? ManagerEmail { get; set; }
    [MaxLength(30)]  public string? ManagerPhone { get; set; }
    [MaxLength(100)] public string? WinnerPrize { get; set; }
    [MaxLength(100)] public string? RunnerUpPrize { get; set; }
    [MaxLength(100)] public string? PrizePool { get; set; }

    // ---- Navigation ----
    public EventTier Tier { get; set; } = null!;
    public EventCategory? Category { get; set; }
    public Venue? Venue { get; set; }

    public ICollection<EventRule> Rules { get; set; } = new List<EventRule>();
    public ICollection<EventCoordinator> Coordinators { get; set; } = new List<EventCoordinator>();
    public ICollection<ScheduleSlot> ScheduleSlots { get; set; } = new List<ScheduleSlot>();
    public ICollection<Registration> Registrations { get; set; } = new List<Registration>();
}

public class EventRule
{
    public int RuleId { get; set; }
    public int EventId { get; set; }
    [Required, MaxLength(500)] public string RuleText { get; set; } = null!;
    public int DisplayOrder { get; set; }

    public Event Event { get; set; } = null!;
}

public class EventCoordinator
{
    public int CoordinatorId { get; set; }
    public int EventId { get; set; }
    [Required, MaxLength(120)] public string FullName { get; set; } = null!;
    [MaxLength(30)]  public string? Phone { get; set; }
    [MaxLength(150)] public string? Email { get; set; }

    public Event Event { get; set; } = null!;
}

public class ScheduleSlot
{
    public int SlotId { get; set; }
    public int? EventId { get; set; }
    public int? VenueId { get; set; }
    public byte DayNumber { get; set; }
    [Required, MaxLength(200)] public string Title { get; set; } = null!;
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    [MaxLength(300)] public string? Notes { get; set; }

    public Event? Event { get; set; }
    public Venue? Venue { get; set; }
}

public class Sponsor
{
    public int SponsorId { get; set; }
    [Required, MaxLength(150)] public string Name { get; set; } = null!;
    [MaxLength(50)] public string? Tier { get; set; }
    [Required, MaxLength(500)] public string LogoUrl { get; set; } = null!;
    [MaxLength(300)] public string? WebsiteUrl { get; set; }
    public int DisplayOrder { get; set; }
}

public class Announcement
{
    public int AnnouncementId { get; set; }
    [Required, MaxLength(200)] public string Title { get; set; } = null!;
    public string? Body { get; set; }
    public bool IsPinned { get; set; }
    public DateTime PublishedAt { get; set; }
    public bool IsActive { get; set; } = true;
}

public class Faq
{
    public int FaqId { get; set; }
    [Required, MaxLength(300)] public string Question { get; set; } = null!;
    [Required] public string Answer { get; set; } = null!;
    public int DisplayOrder { get; set; }
}

public class TeamMember
{
    public int MemberId { get; set; }
    [Required, MaxLength(120)] public string FullName { get; set; } = null!;
    [Required, MaxLength(120)] public string Role { get; set; } = null!;
    [MaxLength(120)] public string? Department { get; set; }
    [MaxLength(500)] public string? PhotoUrl { get; set; }
    [MaxLength(300)] public string? LinkedInUrl { get; set; }
    public int DisplayOrder { get; set; }
}

public class ContactMessage
{
    public int MessageId { get; set; }
    [Required, MaxLength(120)] public string FullName { get; set; } = null!;
    [Required, MaxLength(150)] public string Email { get; set; } = null!;
    [MaxLength(200)] public string? Subject { get; set; }
    [Required, MaxLength(2000)] public string Message { get; set; } = null!;
    [MaxLength(45)] public string? IpAddress { get; set; }
    public DateTime CreatedAt { get; set; }
    public bool IsRead { get; set; }
}

// ===================== Phase 2 tables =====================

public class AdminUser
{
    public int AdminId { get; set; }
    [Required, MaxLength(60)] public string Username { get; set; } = null!;
    [Required, MaxLength(256)] public string PasswordHash { get; set; } = null!;
    [Required, MaxLength(30)] public string Role { get; set; } = "Admin";
    public bool IsActive { get; set; } = true;
}

public class Team
{
    public int TeamId { get; set; }
    [Required, MaxLength(120)] public string TeamName { get; set; } = null!;
    [MaxLength(150)] public string? Institution { get; set; }
    [Required, MaxLength(120)] public string LeaderName { get; set; } = null!;
    [Required, MaxLength(150)] public string LeaderEmail { get; set; } = null!;
    [Required, MaxLength(30)] public string LeaderPhone { get; set; } = null!;
    public DateTime CreatedAt { get; set; }

    public ICollection<TeamParticipant> Participants { get; set; } = new List<TeamParticipant>();
    public ICollection<Registration> Registrations { get; set; } = new List<Registration>();
}

public class TeamParticipant
{
    public int ParticipantId { get; set; }
    public int TeamId { get; set; }
    [Required, MaxLength(120)] public string FullName { get; set; } = null!;
    [MaxLength(150)] public string? Email { get; set; }
    [MaxLength(30)] public string? CnicOrStudentId { get; set; }

    public Team Team { get; set; } = null!;
}

public class Registration
{
    public int RegistrationId { get; set; }
    public int TeamId { get; set; }
    public int EventId { get; set; }
    [Required, MaxLength(20)] public string Status { get; set; } = "Pending";
    [MaxLength(500)] public string? PaymentProofUrl { get; set; }
    public DateTime CreatedAt { get; set; }

    public Team Team { get; set; } = null!;
    public Event Event { get; set; } = null!;
}
