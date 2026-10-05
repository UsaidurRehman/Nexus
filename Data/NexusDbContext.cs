using Microsoft.EntityFrameworkCore;
using Nexus.Api.Models.Entities;

namespace Nexus.Api.Data;

/// <summary>
/// EF Core context for NexusDb.
///
/// Mapped Code-First to the schema supplied in "CREATE DATABASE NexusDb.pdf",
/// including the seven ALTER TABLE columns (Events.ManagerName/ManagerEmail/
/// ManagerPhone/WinnerPrize/RunnerUpPrize/PrizePool and FestInfo.ExecutiveHead).
///
/// DATA-INTEGRITY ADDITIONS (approved during review — the supplied script dropped
/// these; every one is documented in database/SCHEMA-CHANGES.md):
///   • UNIQUE on Events.Slug, EventCategories.Slug, EventTiers.TierLevel,
///     AdminUsers.Username
///   • CHECK  CK_Events_TeamSize       (MinTeamSize &lt;= MaxTeamSize)
///   • CHECK  CK_EventTiers_Level      (TierLevel IN (1,2,3))
///   • CHECK  CK_ScheduleSlots_Time    (StartTime &lt; EndTime)
///   • CHECK  CK_ScheduleSlots_Day     (DayNumber BETWEEN 1 AND 7)
///   • CHECK  CK_Events_EntryFee       (EntryFee IS NULL OR EntryFee &gt;= 0)
///   • DEFAULTs on CreatedAt / IsActive / IsFeatured / PublishedAt / Status
///   • ON DELETE CASCADE for EventRules and EventCoordinators
///   • Indexes on the columns the filter endpoints actually query
/// </summary>
public class NexusDbContext : DbContext
{
    public NexusDbContext(DbContextOptions<NexusDbContext> options) : base(options) { }

    // ---- Phase 1 ----
    public DbSet<FestInfo> FestInfo => Set<FestInfo>();
    public DbSet<EventTier> EventTiers => Set<EventTier>();
    public DbSet<EventCategory> EventCategories => Set<EventCategory>();
    public DbSet<Venue> Venues => Set<Venue>();
    public DbSet<Event> Events => Set<Event>();
    public DbSet<EventRule> EventRules => Set<EventRule>();
    public DbSet<EventCoordinator> EventCoordinators => Set<EventCoordinator>();
    public DbSet<ScheduleSlot> ScheduleSlots => Set<ScheduleSlot>();
    public DbSet<Sponsor> Sponsors => Set<Sponsor>();
    public DbSet<Announcement> Announcements => Set<Announcement>();
    public DbSet<Faq> Faqs => Set<Faq>();
    public DbSet<TeamMember> TeamMembers => Set<TeamMember>();
    public DbSet<ContactMessage> ContactMessages => Set<ContactMessage>();

    // ---- Phase 2 ----
    public DbSet<AdminUser> AdminUsers => Set<AdminUser>();
    public DbSet<Team> Teams => Set<Team>();
    public DbSet<TeamParticipant> TeamParticipants => Set<TeamParticipant>();
    public DbSet<Registration> Registrations => Set<Registration>();

    protected override void OnModelCreating(ModelBuilder b)
    {
        base.OnModelCreating(b);

        // ------------------------------------------------------------------
        // FestInfo — single row enforced by a CHECK on the identity value
        // ------------------------------------------------------------------
        b.Entity<FestInfo>(e =>
        {
            e.ToTable("FestInfo", t =>
                t.HasCheckConstraint("CK_FestInfo_SingleRow", "[FestInfoId] = 1"));
            e.HasKey(x => x.FestInfoId);
        });

        // ------------------------------------------------------------------
        // EventTiers
        // ------------------------------------------------------------------
        b.Entity<EventTier>(e =>
        {
            e.ToTable("EventTiers", t =>
                t.HasCheckConstraint("CK_EventTiers_Level", "[TierLevel] IN (1,2,3)"));
            e.HasKey(x => x.TierId);
            e.HasIndex(x => x.TierLevel).IsUnique().HasDatabaseName("UQ_EventTiers_TierLevel");
            e.Property(x => x.DisplayOrder).HasDefaultValue(0);
        });

        // ------------------------------------------------------------------
        // EventCategories
        // ------------------------------------------------------------------
        b.Entity<EventCategory>(e =>
        {
            e.ToTable("EventCategories");
            e.HasKey(x => x.CategoryId);
            e.HasIndex(x => x.Slug).IsUnique().HasDatabaseName("UQ_EventCategories_Slug");
            e.HasIndex(x => x.Name).IsUnique().HasDatabaseName("UQ_EventCategories_Name");
            e.Property(x => x.DisplayOrder).HasDefaultValue(0);
        });

        // ------------------------------------------------------------------
        // Venues
        // ------------------------------------------------------------------
        b.Entity<Venue>(e =>
        {
            e.ToTable("Venues");
            e.HasKey(x => x.VenueId);
        });

        // ------------------------------------------------------------------
        // Events — the core entity
        // ------------------------------------------------------------------
        b.Entity<Event>(e =>
        {
            e.ToTable("Events", t =>
            {
                t.HasCheckConstraint("CK_Events_TeamSize", "[MinTeamSize] <= [MaxTeamSize]");
                t.HasCheckConstraint("CK_Events_EntryFee", "[EntryFee] IS NULL OR [EntryFee] >= 0");
            });

            e.HasKey(x => x.EventId);

            // Slug is the public URL key — it must be unique.
            e.HasIndex(x => x.Slug).IsUnique().HasDatabaseName("UQ_Events_Slug");

            // Indexes matching the actual filter endpoints.
            e.HasIndex(x => new { x.TierId, x.IsActive }).HasDatabaseName("IX_Events_Tier_Active");
            e.HasIndex(x => new { x.CategoryId, x.IsActive }).HasDatabaseName("IX_Events_Category_Active");
            e.HasIndex(x => new { x.IsFeatured, x.IsActive }).HasDatabaseName("IX_Events_Featured_Active");

            e.Property(x => x.MinTeamSize).HasDefaultValue((byte)1);
            e.Property(x => x.MaxTeamSize).HasDefaultValue((byte)1);
            e.Property(x => x.IsFeatured).HasDefaultValue(false);
            e.Property(x => x.IsActive).HasDefaultValue(true);
            e.Property(x => x.CreatedAt).HasDefaultValueSql("SYSUTCDATETIME()");

            e.HasOne(x => x.Tier)
             .WithMany(t => t.Events)
             .HasForeignKey(x => x.TierId)
             .OnDelete(DeleteBehavior.Restrict);

            e.HasOne(x => x.Category)
             .WithMany(c => c.Events)
             .HasForeignKey(x => x.CategoryId)
             .OnDelete(DeleteBehavior.SetNull);

            e.HasOne(x => x.Venue)
             .WithMany(v => v.Events)
             .HasForeignKey(x => x.VenueId)
             .OnDelete(DeleteBehavior.SetNull);
        });

        // ------------------------------------------------------------------
        // EventRules — cascade with the parent event
        // ------------------------------------------------------------------
        b.Entity<EventRule>(e =>
        {
            e.ToTable("EventRules");
            e.HasKey(x => x.RuleId);
            e.HasIndex(x => x.EventId).HasDatabaseName("IX_EventRules_EventId");
            e.Property(x => x.DisplayOrder).HasDefaultValue(0);

            e.HasOne(x => x.Event)
             .WithMany(ev => ev.Rules)
             .HasForeignKey(x => x.EventId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        // ------------------------------------------------------------------
        // EventCoordinators — cascade with the parent event
        // ------------------------------------------------------------------
        b.Entity<EventCoordinator>(e =>
        {
            e.ToTable("EventCoordinators");
            e.HasKey(x => x.CoordinatorId);
            e.HasIndex(x => x.EventId).HasDatabaseName("IX_EventCoordinators_EventId");

            // Stops the duplicate-coordinator bug found in the supplied seed script:
            // the same person could be inserted twice against one event.
            e.HasIndex(x => new { x.EventId, x.FullName })
             .IsUnique()
             .HasDatabaseName("UQ_EventCoordinators_Event_Name");

            e.HasOne(x => x.Event)
             .WithMany(ev => ev.Coordinators)
             .HasForeignKey(x => x.EventId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        // ------------------------------------------------------------------
        // ScheduleSlots
        // ------------------------------------------------------------------
        b.Entity<ScheduleSlot>(e =>
        {
            e.ToTable("ScheduleSlots", t =>
            {
                t.HasCheckConstraint("CK_ScheduleSlots_Time", "[StartTime] < [EndTime]");
                t.HasCheckConstraint("CK_ScheduleSlots_Day", "[DayNumber] BETWEEN 1 AND 7");
            });
            e.HasKey(x => x.SlotId);
            e.HasIndex(x => new { x.DayNumber, x.StartTime })
             .HasDatabaseName("IX_ScheduleSlots_Day_Start");

            e.HasOne(x => x.Event)
             .WithMany(ev => ev.ScheduleSlots)
             .HasForeignKey(x => x.EventId)
             .OnDelete(DeleteBehavior.Cascade);

            e.HasOne(x => x.Venue)
             .WithMany(v => v.ScheduleSlots)
             .HasForeignKey(x => x.VenueId)
             .OnDelete(DeleteBehavior.SetNull);
        });

        // ------------------------------------------------------------------
        // Standalone content tables
        // ------------------------------------------------------------------
        b.Entity<Sponsor>(e =>
        {
            e.ToTable("Sponsors");
            e.HasKey(x => x.SponsorId);
            e.Property(x => x.DisplayOrder).HasDefaultValue(0);
        });

        b.Entity<Announcement>(e =>
        {
            e.ToTable("Announcements");
            e.HasKey(x => x.AnnouncementId);
            e.Property(x => x.IsPinned).HasDefaultValue(false);
            e.Property(x => x.IsActive).HasDefaultValue(true);
            e.Property(x => x.PublishedAt).HasDefaultValueSql("SYSUTCDATETIME()");
        });

        b.Entity<Faq>(e =>
        {
            e.ToTable("Faqs");
            e.HasKey(x => x.FaqId);
            e.Property(x => x.DisplayOrder).HasDefaultValue(0);
        });

        b.Entity<TeamMember>(e =>
        {
            e.ToTable("TeamMembers");
            e.HasKey(x => x.MemberId);
            e.Property(x => x.DisplayOrder).HasDefaultValue(0);
        });

        b.Entity<ContactMessage>(e =>
        {
            e.ToTable("ContactMessages");
            e.HasKey(x => x.MessageId);
            e.Property(x => x.IsRead).HasDefaultValue(false);
            e.Property(x => x.CreatedAt).HasDefaultValueSql("SYSUTCDATETIME()");
        });

        // ------------------------------------------------------------------
        // Phase 2
        // ------------------------------------------------------------------
        b.Entity<AdminUser>(e =>
        {
            e.ToTable("AdminUsers");
            e.HasKey(x => x.AdminId);
            e.HasIndex(x => x.Username).IsUnique().HasDatabaseName("UQ_AdminUsers_Username");
            e.Property(x => x.Role).HasDefaultValue("Admin");
            e.Property(x => x.IsActive).HasDefaultValue(true);
        });

        b.Entity<Team>(e =>
        {
            e.ToTable("Teams");
            e.HasKey(x => x.TeamId);
            e.Property(x => x.CreatedAt).HasDefaultValueSql("SYSUTCDATETIME()");
        });

        b.Entity<TeamParticipant>(e =>
        {
            e.ToTable("TeamParticipants");
            e.HasKey(x => x.ParticipantId);
            e.HasOne(x => x.Team)
             .WithMany(t => t.Participants)
             .HasForeignKey(x => x.TeamId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        b.Entity<Registration>(e =>
        {
            e.ToTable("Registrations", t =>
                t.HasCheckConstraint("CK_Registrations_Status",
                    "[Status] IN ('Pending','Approved','Rejected')"));
            e.HasKey(x => x.RegistrationId);
            e.HasIndex(x => new { x.TeamId, x.EventId })
             .IsUnique()
             .HasDatabaseName("UQ_Registrations_Team_Event");
            e.Property(x => x.Status).HasDefaultValue("Pending");
            e.Property(x => x.CreatedAt).HasDefaultValueSql("SYSUTCDATETIME()");

            e.HasOne(x => x.Team)
             .WithMany(t => t.Registrations)
             .HasForeignKey(x => x.TeamId)
             .OnDelete(DeleteBehavior.Cascade);

            e.HasOne(x => x.Event)
             .WithMany(ev => ev.Registrations)
             .HasForeignKey(x => x.EventId)
             .OnDelete(DeleteBehavior.Restrict);
        });
    }

    /// <summary>Stamps UpdatedAt automatically on every modified Event.</summary>
    public override int SaveChanges()
    {
        StampTimestamps();
        return base.SaveChanges();
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        StampTimestamps();
        return base.SaveChangesAsync(cancellationToken);
    }

    private void StampTimestamps()
    {
        foreach (var entry in ChangeTracker.Entries<Event>())
        {
            if (entry.State == EntityState.Added && entry.Entity.CreatedAt == default)
                entry.Entity.CreatedAt = DateTime.UtcNow;

            if (entry.State == EntityState.Modified)
                entry.Entity.UpdatedAt = DateTime.UtcNow;
        }
    }
}
