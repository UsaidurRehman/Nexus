using Microsoft.EntityFrameworkCore;
using Nexus.Api.Models.Entities;

namespace Nexus.Api.Data;

/// <summary>
/// Idempotent seeder mirroring the INSERT script in "CREATE DATABASE NexusDb.pdf".
///
/// Differences from the raw script (all intentional, all approved):
///   • Coordinators are seeded ONCE. The supplied script inserts several of them
///     twice (inline, then again in section 6 via UNION ALL).
///   • Phone numbers are normalised to the local 03XXXXXXXXX form. The script
///     stores the same person as both "03165621069" and "+92 316 5621069".
///   • Runs only when a table is empty, so restarting the API never duplicates data.
/// </summary>
public static class DbSeeder
{
    public static async Task SeedAsync(NexusDbContext db, ILogger logger, string adminPassword)
    {
        await SeedTiersAsync(db, logger);
        await SeedCategoriesAsync(db, logger);
        await SeedFestInfoAsync(db, logger);
        await SeedTeamMembersAsync(db, logger);
        await SeedEventsAsync(db, logger);
        await SeedCoordinatorsAsync(db, logger);
        await SeedRulesAsync(db, logger);
        await SeedFaqsAsync(db, logger);
        await SeedAdminAsync(db, logger, adminPassword);
    }

    // ------------------------------------------------------------------
    private static async Task SeedTiersAsync(NexusDbContext db, ILogger log)
    {
        if (await db.EventTiers.AnyAsync()) return;

        db.EventTiers.AddRange(
            new EventTier { TierLevel = 1, Name = "Tier 1", Description = "Flag-Ship", DisplayOrder = 1 },
            new EventTier { TierLevel = 2, Name = "Tier 2", Description = "Mid-level events", DisplayOrder = 2 },
            new EventTier { TierLevel = 3, Name = "Tier 3", Description = "Internal events", DisplayOrder = 3 });

        await db.SaveChangesAsync();
        log.LogInformation("Seeded 3 event tiers");
    }

    // ------------------------------------------------------------------
    private static async Task SeedCategoriesAsync(NexusDbContext db, ILogger log)
    {
        if (await db.EventCategories.AnyAsync()) return;

        db.EventCategories.AddRange(
            new EventCategory { Name = "Programming & Software", Slug = "programming-software", IconName = "code", DisplayOrder = 1 },
            new EventCategory { Name = "AI & Security", Slug = "ai-security", IconName = "cpu", DisplayOrder = 2 },
            new EventCategory { Name = "Mathematics & Logic", Slug = "mathematics-logic", IconName = "calculator", DisplayOrder = 3 },
            new EventCategory { Name = "Gaming & Game Dev", Slug = "gaming-game-dev", IconName = "gamepad", DisplayOrder = 4 },
            new EventCategory { Name = "Sports", Slug = "sports", IconName = "activity", DisplayOrder = 5 },
            new EventCategory { Name = "Islamic & Knowledge", Slug = "islamic-knowledge", IconName = "book", DisplayOrder = 6 },
            new EventCategory { Name = "Cultural & Arts", Slug = "cultural-arts", IconName = "music", DisplayOrder = 7 });

        await db.SaveChangesAsync();
        log.LogInformation("Seeded 7 event categories");
    }

    // ------------------------------------------------------------------
    private static async Task SeedFestInfoAsync(NexusDbContext db, ILogger log)
    {
        if (await db.FestInfo.AnyAsync()) return;

        db.FestInfo.Add(new FestInfo
        {
            Name = "BIIT Nexus 2026",
            Tagline = "Climate Resilience & Sustainability",
            Description =
                "A 5-day inter-university regional festival transitioning from campus Techfest to a " +
                "unified regional event. Features a 10-15% climate relevance weighting across flagship rubrics.",
            StartDate = new DateTime(2026, 11, 1, 9, 0, 0),
            EndDate = new DateTime(2026, 11, 5, 18, 0, 0),
            VenueSummary = "BIIT Campus & Off-site Venues",
            ContactEmail = "info@biitnexus.edu.pk",
            ContactPhone = "+92-51-111-222-333",
            ExecutiveHead = "Abdullah Khan",
            LogoUrl = "/brand/nexus-logo.png",
            BannerUrl = "/brand/nexus-hero.jpg",
        });

        await db.SaveChangesAsync();
        log.LogInformation("Seeded FestInfo (BIIT Nexus 2026)");
    }

    // ------------------------------------------------------------------
    private static async Task SeedTeamMembersAsync(NexusDbContext db, ILogger log)
    {
        if (await db.TeamMembers.AnyAsync()) return;

        var members = new (string Name, string Role, string Dept)[]
        {
            ("Abdullah Khan",         "Executive Head",             "Executive Council"),
            ("Saim Iftikhar",         "Executive Council Member",   "Executive Council"),
            ("Abdul Wasay",           "Executive Council Member",   "Executive Council"),
            ("Syed Saad Hassan",      "Executive Council Member",   "Executive Council"),
            ("M Mujtaba",             "Executive Council Member",   "Executive Council"),
            ("Muhammad Usman Kiani",  "Executive Council Member",   "Executive Council"),
            ("M. Maarij",             "Management Lead",            "Management"),
            ("Muskan",                "Media Lead",                 "Media"),
            ("Tayyaba Kousar",        "Logistics Lead",             "Logistics"),
            ("Raja Mukaram",          "Operations Lead",            "Operations"),
            ("Zargham",               "Graphics Lead",              "Graphics"),
            ("Ayesha Kiyani",         "Volunteers Lead",            "Volunteers"),
            ("Talal Kiyani",          "PR & Marketing Lead",        "PR & Marketing"),
            ("M. Afaq Saim",          "Security Lead",              "Security"),
            ("Abdul Subhan",          "Sponsorship & Liaison Lead", "Sponsorship Council"),
            ("Summiya Shakeel",       "Lead General Secretary",     "Secretariat"),
        };

        var order = 1;
        foreach (var (name, role, dept) in members)
        {
            db.TeamMembers.Add(new TeamMember
            {
                FullName = name,
                Role = role,
                Department = dept,
                DisplayOrder = order++,
            });
        }

        await db.SaveChangesAsync();
        log.LogInformation("Seeded {Count} team members", members.Length);
    }

    // ------------------------------------------------------------------
    private record SeedEvent(
        byte TierLevel, string CategorySlug, string Title, string Slug,
        string Summary, string Description,
        byte Min, byte Max, decimal? Fee,
        string? PrizeInfo = null, string? Duration = null, bool Featured = false);

    private static async Task SeedEventsAsync(NexusDbContext db, ILogger log)
    {
        if (await db.Events.AnyAsync()) return;

        var tiers = await db.EventTiers.ToDictionaryAsync(t => t.TierLevel, t => t.TierId);
        var cats = await db.EventCategories.ToDictionaryAsync(c => c.Slug, c => c.CategoryId);

        var seed = new List<SeedEvent>
        {
            // ---------------- PROGRAMMING & SOFTWARE ----------------
            new(1, "programming-software", "Code Relay", "code-relay",
                "A 4-member team relay coding challenge on task scheduling with circular dependency detection.",
                "Teammates take turns coding in blind, strictly-timed 5-minute turns with zero verbal communication allowed between hand-offs. Together, the team must build a working task scheduler that detects circular dependencies, produces a valid execution order, and computes a project's critical path using CPM.",
                4, 4, 1500.00m, Featured: true),

            new(2, "programming-software", "Debug the Disaster", "debug-the-disaster",
                "Identify, fix, and document 8 injected bugs in a Python Library Management System.",
                "Hands every team the identical, deliberately broken Library Management System written in Python with 8 injected bugs ranging from simple logic errors to an advanced-level Python trap. Teams must diagnose, fix, and document every bug.",
                4, 4, 1200.00m),

            new(1, "programming-software", "Protocol: Zero - Speed Programming", "protocol-zero",
                "Inter-university speed programming competition across 4 progressive algorithmic rounds on HackerRank.",
                "Challenges students through algorithmic problem-solving tasks across four progressive rounds, solving problems involving data structures, algorithms, optimization, and logical thinking under time constraints.",
                1, 3, 1500.00m, Featured: true),

            new(1, "programming-software", "Application Development Competition", "application-development",
                "Turn a problem statement or application idea into a fully working hosted application within event timeframe.",
                "Teams receive a problem statement at the start and must build a working application using any technology stack, framework, or database. Must submit source code and live hosted link.",
                3, 5, 2000.00m, Featured: true),

            // ---------------- AI & SECURITY ----------------
            new(2, "ai-security", "AI Neural Lock: Escape the System", "ai-neural-lock",
                "Three-stage AI competition: Prompt Engineering, Coding Challenge, and Debugging Challenge.",
                "Teams are trapped inside a fictional AI-controlled system. To escape, they must break through three Neural Locks testing Prompt Engineering/Reasoning, Coding, and System Debugging.",
                2, 3, 1500.00m),

            new(1, "ai-security", "Operation Tipping Point: Climate Forensics", "operation-tipping-point",
                "150-minute climate forensics challenge combining SQL audit logs, Python sensor cleaning, and cryptography.",
                "Investigate a breach at South Asia Observatory Network. Round 1 uses SQL audit logs, Round 2 cleans Python sensor logs, Round 3 decrypts ciphers, and Round 4 computes the final code from climate data.",
                2, 3, 1500.00m,
                PrizeInfo: "Prize Pool: 40,000 PKR (Winner: 25,000 / Runner-Up: 15,000)",
                Duration: "150 minutes", Featured: true),

            new(1, "ai-security", "Resilience Nexus (AI)", "resilience-nexus-ai",
                "Flagship AI competition on deforestation detection, flood forecasting, and interactive local GUI packaging.",
                "Teams tackle environmental challenges in South Asia using satellite and climate datasets over 3 rounds. Models must generalize to unseen regions and be packaged into a local interactive GUI.",
                2, 3, 2000.00m, Featured: true),

            // ---------------- MATHEMATICS & LOGIC ----------------
            new(3, "mathematics-logic", "MINDX - Mathematics", "mindx-mathematics",
                "Fast-paced knowledge test with 50 numerical and logic MCQs in 50 minutes with negative marking.",
                "High-pressure numerical and logic test containing 50 questions requiring rapid problem-solving across core math subjects and analytical reasoning.",
                1, 1, 500.00m, Duration: "50 minutes"),

            new(2, "mathematics-logic", "The Turing Trap (Escape Room)", "the-turing-trap",
                "Immersive physical room puzzle with mathematical, algorithmic, and cryptographic lockboxes.",
                "Participants are locked in a room and must work collaboratively to solve interconnected mathematical, algorithmic, and cryptographic puzzles to obtain physical combination lockbox codes.",
                2, 4, 1500.00m),

            new(2, "mathematics-logic", "Build Your Own Algorithm Challenge", "build-your-own-algorithm",
                "Design an optimized pathfinding and load-balancing algorithm for a multi-node network failure.",
                "Evaluate a simulated multi-node network failure case study, write an algorithm to reroute traffic under constraints, perform time-complexity analysis, and defend the solution orally before judges.",
                1, 3, 1000.00m),

            // ---------------- GAMING & GAME DEV ----------------
            new(2, "gaming-game-dev", "Discord Couch Party Game Jam", "discord-couch-party-game-jam",
                "Build a couch-party style multiplayer game and present it live over Discord.",
                "Teams design and build a party-style multiplayer game within the event window, then demo it live with judges and the audience joining over Discord.",
                2, 4, 1500.00m),

            // ---------------- CULTURAL & ARTS ----------------
            new(3, "cultural-arts", "Singing Competition With Track", "singing-competition",
                "Solo vocal performance accompanied by a pre-selected backing track.",
                "Participants perform a song of their choice with an approved backing track. Judged on vocal control, pitch accuracy, expression and overall stage presence.",
                1, 1, 500.00m),

            new(3, "cultural-arts", "Skit Competition", "skit-competition",
                "Short-form stage drama performed by a team within a strict time limit.",
                "Teams write and perform an original skit. Judged on script originality, acting quality, coordination, timing and audience impact.",
                3, 8, 1500.00m),

            new(3, "cultural-arts", "Cooking Competition (Chicken Biryani)", "cooking-competition",
                "Live cook-off where teams prepare chicken biryani within the allotted time.",
                "Teams cook chicken biryani on site within a fixed time window. Judged on taste, aroma, presentation, hygiene and efficient use of ingredients.",
                2, 4, 1500.00m),

            new(3, "cultural-arts", "Stand Up Comedy Competition", "standup-comedy",
                "Solo stand-up set performed live before judges and a student audience.",
                "Participants deliver an original stand-up routine within the time limit. Judged on originality, delivery, timing and audience response. Content must remain respectful.",
                1, 1, 500.00m),

            new(3, "cultural-arts", "Cultural Stall Competition", "cultural-stall",
                "Teams design and run a cultural stall representing a region or theme.",
                "Teams set up a themed cultural stall with decor, food, artefacts or performances. Judged on authenticity, presentation, creativity and visitor engagement.",
                2, 6, 1500.00m),

            // ---------------- ISLAMIC & KNOWLEDGE ----------------
            new(2, "islamic-knowledge", "Seerat Escape Room Competition", "seerat-escape-room",
                "Seerat-themed escape room blending historical knowledge with physical puzzles.",
                "Teams solve a sequence of puzzles rooted in the Seerat of the Prophet (PBUH), combining historical knowledge with logic challenges to unlock the final code.",
                2, 4, 1500.00m),

            new(3, "islamic-knowledge", "Naat & Qirat Competition", "naat-and-qirat",
                "Individual recitation competition across Naat and Qirat categories.",
                "Participants present Naat or Qirat before a judging panel. Evaluated on tajweed, pronunciation, melody, composure and overall presentation.",
                1, 1, 300.00m),

            new(3, "islamic-knowledge", "Seerat Quiz Competition", "seerat-quiz",
                "Team quiz covering the life, character and teachings of the Prophet (PBUH).",
                "A multi-round quiz on the Seerat covering historical events, character and teachings. Includes rapid-fire and buzzer rounds with negative marking.",
                2, 3, 500.00m),

            // ---------------- SPORTS ----------------
            new(2, "sports", "Futsal Tournament", "futsal-tournament",
                "Five-a-side knockout futsal tournament played across the festival days.",
                "Teams compete in a knockout futsal bracket. Standard futsal rules apply with match durations and substitution limits announced at the captains' briefing.",
                5, 8, 3000.00m),

            new(3, "sports", "Chess Tournament", "chess-tournament",
                "Individual Swiss-system chess tournament with standard time controls.",
                "Players compete over multiple Swiss rounds under standard FIDE rules. Tie-breaks decided by Buchholz score.",
                1, 1, 500.00m),

            new(3, "sports", "Table Tennis Singles", "table-tennis-singles",
                "Single-elimination table tennis singles bracket.",
                "One-versus-one knockout tournament. Matches are best of three games to 11 points, win by two.",
                1, 1, 500.00m),

            new(3, "sports", "Arm Wrestling Competition", "arm-wrestling",
                "Weight-class arm wrestling knockout with on-site weigh-in.",
                "Competitors are grouped by weight class after an on-site weigh-in, then compete in a knockout bracket under standard arm wrestling rules and referee supervision.",
                1, 1, 300.00m),

            new(3, "gaming-game-dev", "Ludo Competition", "ludo-competition",
                "Classic Ludo knockout tournament run across the festival days.",
                "Players compete in a knockout Ludo bracket. Match format, dice rules and time limits are announced before the first round.",
                1, 1, 200.00m),
        };

        foreach (var s in seed)
        {
            db.Events.Add(new Event
            {
                TierId = tiers[s.TierLevel],
                CategoryId = cats.TryGetValue(s.CategorySlug, out var cid) ? cid : null,
                Title = s.Title,
                Slug = s.Slug,
                ShortSummary = s.Summary,
                Description = s.Description,
                MinTeamSize = s.Min,
                MaxTeamSize = s.Max,
                EntryFee = s.Fee,
                PrizeInfo = s.PrizeInfo,
                DurationText = s.Duration,
                IsFeatured = s.Featured,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
            });
        }

        await db.SaveChangesAsync();
        log.LogInformation("Seeded {Count} events", seed.Count);
    }

    // ------------------------------------------------------------------
    private static async Task SeedCoordinatorsAsync(NexusDbContext db, ILogger log)
    {
        if (await db.EventCoordinators.AnyAsync()) return;

        // Phone numbers normalised to local 03XXXXXXXXX. Each person appears ONCE.
        var coordinators = new (string Slug, string Name, string? Phone, string? Email)[]
        {
            ("debug-the-disaster",            "Nizhat Imtiaz",                 "03165621069", "nizhatwork1@gmail.com"),
            ("protocol-zero",                 "Muhammad Usman",                "03115347467", "ukiyani768@gmail.com"),
            ("application-development",       "Zia Un Noor",                   "03199976313", "nnoorr0625@gmail.com"),
            ("ai-neural-lock",                "Nadiha",                        "03445961797", "2025-arid-0177@biit.edu.pk"),
            ("operation-tipping-point",       "Saad Abdullah Shahzad",         "03335639776", "docs.saad@gmail.com"),
            ("resilience-nexus-ai",           "Muhammad Sheraz",               "03214172142", "sherazalvi142@gmail.com"),
            ("mindx-mathematics",             "Ume Tayyaba",                   "03455008027", "umetayyaba17@gmail.com"),
            ("the-turing-trap",               "Abdul Rehman",                  "03311200207", "abdurahmansami7@gmail.com"),
            ("build-your-own-algorithm",      "Qazi Huzaifa",                  "03493755894", "qazihuzaifa302@gmail.com"),
            ("discord-couch-party-game-jam",  "Muhammad Mujtaba",              "03255468113", "mujtaba.office.mail@gmail.com"),
            ("seerat-escape-room",            "Muhammad Aftab Nisar",          "03019014205", "raoaftab0325@gmail.com"),
            ("naat-and-qirat",                "Syed Muhammad Ali",             "03231595450", null),
            ("seerat-quiz",                   "Syed Muhammad Iqyan Ali Naqvi", "03256432091", "iqyanshah165@gmail.com"),
            ("futsal-tournament",             "Ehtisam Nadir",                 "03305374422", "ehtisam19@gmail.com"),
            ("chess-tournament",              "Muhammad Fasih Yaseen",         "03379251535", "fasihyaseen250@gmail.com"),
            ("table-tennis-singles",          "Zakariya Umar",                 "03405561259", "zakariyaumar007@gmail.com"),
            ("arm-wrestling",                 "Abdul Arham",                   "03239395089", "arhamabdul327@gmail.com"),
            ("ludo-competition",              "Saad Abdullah Shahzad",         "03335639776", "info.saadsh@gmail.com"),
        };

        var events = await db.Events.ToDictionaryAsync(e => e.Slug, e => e.EventId);
        var added = 0;

        foreach (var (slug, name, phone, email) in coordinators)
        {
            if (!events.TryGetValue(slug, out var eventId)) continue;

            db.EventCoordinators.Add(new EventCoordinator
            {
                EventId = eventId,
                FullName = name,
                Phone = phone,
                Email = email,
            });
            added++;
        }

        await db.SaveChangesAsync();
        log.LogInformation("Seeded {Count} event coordinators (de-duplicated)", added);
    }

    // ------------------------------------------------------------------
    private static async Task SeedRulesAsync(NexusDbContext db, ILogger log)
    {
        if (await db.EventRules.AnyAsync()) return;

        var rules = new Dictionary<string, string[]>
        {
            ["code-relay"] = new[]
            {
                "Teams must consist of exactly 4 members.",
                "Each turn lasts a strictly timed 5 minutes; the keyboard must change hands at the buzzer.",
                "Absolutely no verbal communication is allowed between hand-offs.",
                "The scheduler must detect circular dependencies and produce a valid execution order.",
                "The critical path must be computed using CPM.",
                "Any form of external help or internet lookup during a turn results in disqualification.",
            },
            ["debug-the-disaster"] = new[]
            {
                "Teams of exactly 4 receive the identical broken Python codebase.",
                "All 8 injected bugs must be diagnosed, fixed and documented.",
                "Documentation must explain the root cause of each bug, not just the fix.",
                "The full test suite must pass for a fix to be counted.",
                "Rewriting the system from scratch is not permitted.",
            },
            ["protocol-zero"] = new[]
            {
                "The contest runs on HackerRank across four progressive rounds.",
                "Teams of 1 to 3 members are permitted.",
                "Only the languages listed on the contest page may be used.",
                "Plagiarism checks are run on every submission; copied code is disqualified.",
                "Ranking is by problems solved, with time penalties breaking ties.",
            },
            ["application-development"] = new[]
            {
                "Teams of 3 to 5 members.",
                "The problem statement is released at the start of the event.",
                "Any technology stack, framework or database may be used.",
                "Both source code and a live hosted link must be submitted before the deadline.",
                "Pre-built projects are strictly prohibited and will be disqualified.",
            },
            ["operation-tipping-point"] = new[]
            {
                "The challenge runs for 150 minutes across four rounds.",
                "Round 1 requires SQL querying of audit logs.",
                "Round 2 requires cleaning sensor data in Python.",
                "Round 3 requires decrypting the supplied ciphers.",
                "Round 4 computes the final code from the climate dataset.",
                "Teams of 2 to 3 members. Internet access is restricted to documentation only.",
            },
            ["resilience-nexus-ai"] = new[]
            {
                "Teams of 2 to 3 members compete across 3 rounds.",
                "Models must generalise to unseen regions; overfitting to the sample set scores zero.",
                "The final deliverable must be packaged as a local interactive GUI.",
                "Only the provided satellite and climate datasets may be used for training.",
                "A climate relevance weighting of 10-15% is applied to the final rubric.",
            },
            ["mindx-mathematics"] = new[]
            {
                "Individual event: 50 questions in 50 minutes.",
                "Negative marking applies to every incorrect answer.",
                "Calculators and mobile phones are not permitted.",
                "Rough work must be done on the sheets provided and handed in.",
            },
            ["the-turing-trap"] = new[]
            {
                "Teams of 2 to 4 are locked in the room together.",
                "All puzzles must be solved to obtain the physical lockbox codes.",
                "Mobile phones are surrendered before entry.",
                "Forcing or damaging any lock or prop results in immediate disqualification.",
                "The fastest escape time wins; unopened boxes count as a time penalty.",
            },
        };

        var events = await db.Events.ToDictionaryAsync(e => e.Slug, e => e.EventId);
        var count = 0;

        foreach (var (slug, texts) in rules)
        {
            if (!events.TryGetValue(slug, out var eventId)) continue;

            var order = 1;
            foreach (var text in texts)
            {
                db.EventRules.Add(new EventRule
                {
                    EventId = eventId,
                    RuleText = text,
                    DisplayOrder = order++,
                });
                count++;
            }
        }

        await db.SaveChangesAsync();
        log.LogInformation("Seeded {Count} event rules", count);
    }

    // ------------------------------------------------------------------
    private static async Task SeedFaqsAsync(NexusDbContext db, ILogger log)
    {
        if (await db.Faqs.AnyAsync()) return;

        db.Faqs.AddRange(
            new Faq
            {
                Question = "What is BIIT Nexus 2026?",
                Answer = "BIIT Nexus is a 5-day regional inter-university festival bringing together technical, creative, and athletic talent under the theme of Climate Resilience & Sustainability.",
                DisplayOrder = 1,
            },
            new Faq
            {
                Question = "Is manual/paper registration allowed?",
                Answer = "No. All registrations and team sign-ups must be processed online through the official web portal.",
                DisplayOrder = 2,
            },
            new Faq
            {
                Question = "Is there a discount for BIIT students?",
                Answer = "Yes, all enrolled BIIT students receive an exclusive 50% discount on event registrations.",
                DisplayOrder = 3,
            },
            new Faq
            {
                Question = "How do Campus Ambassador discount codes work?",
                Answer = "Campus Ambassadors are provided unique promotional codes that grant external participants a 20% discount on event registration.",
                DisplayOrder = 4,
            },
            new Faq
            {
                Question = "How is venue access managed?",
                Answer = "Upon online registration, participants receive a unique QR code. Scanned QR codes at the gate issue day-specific, color-coded entry wristbands.",
                DisplayOrder = 5,
            });

        await db.SaveChangesAsync();
        log.LogInformation("Seeded 5 FAQs");
    }

    // ------------------------------------------------------------------
    private static async Task SeedAdminAsync(NexusDbContext db, ILogger log, string password)
    {
        if (await db.AdminUsers.AnyAsync()) return;

        db.AdminUsers.Add(new AdminUser
        {
            Username = "admin",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(password),
            Role = "Admin",
            IsActive = true,
        });

        await db.SaveChangesAsync();
        log.LogWarning("Seeded default admin user 'admin'. CHANGE THE PASSWORD BEFORE DEPLOYING.");
    }
}
