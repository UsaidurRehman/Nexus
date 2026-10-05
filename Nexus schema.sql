CREATE DATABASE NexusDb;
GO

USE NexusDb;
GO

-- =============================================
-- Phase 1 Tables (Simplified Schema)
-- =============================================

-- Single-row table with fest-level info[cite: 4]
CREATE TABLE FestInfo (
    FestInfoId INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(150) NOT NULL,
    Tagline NVARCHAR(250) NULL,
    Description NVARCHAR(MAX) NULL,
    StartDate DATETIME2 NOT NULL,
    EndDate DATETIME2 NOT NULL,
    VenueSummary NVARCHAR(250) NULL,
    LogoUrl NVARCHAR(500) NULL,
    BannerUrl NVARCHAR(500) NULL,
    ContactEmail NVARCHAR(150) NULL,
    ContactPhone NVARCHAR(30) NULL,
    InstagramUrl NVARCHAR(300) NULL,
    LinkedInUrl NVARCHAR(300) NULL,
    FacebookUrl NVARCHAR(300) NULL
);

-- Event Tiers[cite: 5]
CREATE TABLE EventTiers (
    TierId INT IDENTITY(1,1) PRIMARY KEY,
    TierLevel TINYINT NOT NULL,
    Name NVARCHAR(100) NOT NULL,
    Description NVARCHAR(300) NULL,
    DisplayOrder INT NOT NULL
);

-- Event Categories[cite: 5]
CREATE TABLE EventCategories (
    CategoryId INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(100) NOT NULL,
    Slug NVARCHAR(120) NOT NULL,
    IconName NVARCHAR(60) NULL,
    DisplayOrder INT NOT NULL
);

-- Venues table[cite: 5]
CREATE TABLE Venues (
    VenueId INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(150) NOT NULL,
    Building NVARCHAR(150) NULL,
    Capacity INT NULL,
    MapUrl NVARCHAR(500) NULL,
    Notes NVARCHAR(500) NULL
);

-- Main Events table[cite: 5]
CREATE TABLE Events (
    EventId INT IDENTITY(1,1) PRIMARY KEY,
    TierId INT NOT NULL REFERENCES EventTiers (TierId),
    CategoryId INT NULL REFERENCES EventCategories (CategoryId),
    VenueId INT NULL REFERENCES Venues (VenueId),
    Title NVARCHAR(200) NOT NULL,
    Slug NVARCHAR(220) NOT NULL,
    ShortSummary NVARCHAR(300) NULL,
    Description NVARCHAR(MAX) NULL,
    ImageUrl NVARCHAR(500) NULL,
    DurationText NVARCHAR(60) NULL,
    MinTeamSize TINYINT NOT NULL,
    MaxTeamSize TINYINT NOT NULL,
    PrizeInfo NVARCHAR(300) NULL,
    EntryFee DECIMAL(10,2) NULL,
    IsFeatured BIT NOT NULL,
    IsActive BIT NOT NULL,
    CreatedAt DATETIME2 NOT NULL,
    UpdatedAt DATETIME2 NULL
);

-- Rules associated with specific events[cite: 5]
CREATE TABLE EventRules (
    RuleId INT IDENTITY(1,1) PRIMARY KEY,
    EventId INT NOT NULL REFERENCES Events (EventId),
    RuleText NVARCHAR(500) NOT NULL,
    DisplayOrder INT NOT NULL
);

-- Event Coordinators[cite: 5]
CREATE TABLE EventCoordinators (
    CoordinatorId INT IDENTITY(1,1) PRIMARY KEY,
    EventId INT NOT NULL REFERENCES Events (EventId),
    FullName NVARCHAR(120) NOT NULL,
    Phone NVARCHAR(30) NULL,
    Email NVARCHAR(150) NULL
);

-- Event Schedule Slots[cite: 6]
CREATE TABLE ScheduleSlots (
    SlotId INT IDENTITY(1,1) PRIMARY KEY,
    EventId INT NULL REFERENCES Events (EventId),
    VenueId INT NULL REFERENCES Venues (VenueId),
    DayNumber TINYINT NOT NULL,
    Title NVARCHAR(200) NOT NULL,
    StartTime DATETIME2 NOT NULL,
    EndTime DATETIME2 NOT NULL,
    Notes NVARCHAR(300) NULL
);

-- Sponsors table[cite: 6]
CREATE TABLE Sponsors (
    SponsorId INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(150) NOT NULL,
    Tier NVARCHAR(50) NULL,
    LogoUrl NVARCHAR(500) NOT NULL,
    WebsiteUrl NVARCHAR(300) NULL,
    DisplayOrder INT NOT NULL
);

-- Announcements table[cite: 6]
CREATE TABLE Announcements (
    AnnouncementId INT IDENTITY(1,1) PRIMARY KEY,
    Title NVARCHAR(200) NOT NULL,
    Body NVARCHAR(MAX) NULL,
    IsPinned BIT NOT NULL,
    PublishedAt DATETIME2 NOT NULL,
    IsActive BIT NOT NULL
);

-- Frequently Asked Questions[cite: 6]
CREATE TABLE Faqs (
    FaqId INT IDENTITY(1,1) PRIMARY KEY,
    Question NVARCHAR(300) NOT NULL,
    Answer NVARCHAR(MAX) NOT NULL,
    DisplayOrder INT NOT NULL
);

-- Team Members / Organizing Committee[cite: 6]
CREATE TABLE TeamMembers (
    MemberId INT IDENTITY(1,1) PRIMARY KEY,
    FullName NVARCHAR(120) NOT NULL,
    Role NVARCHAR(120) NOT NULL,
    Department NVARCHAR(120) NULL,
    PhotoUrl NVARCHAR(500) NULL,
    LinkedInUrl NVARCHAR(300) NULL,
    DisplayOrder INT NOT NULL
);

-- Contact Messages[cite: 6]
CREATE TABLE ContactMessages (
    MessageId INT IDENTITY(1,1) PRIMARY KEY,
    FullName NVARCHAR(120) NOT NULL,
    Email NVARCHAR(150) NOT NULL,
    Subject NVARCHAR(200) NULL,
    Message NVARCHAR(2000) NOT NULL,
    IpAddress NVARCHAR(45) NULL,
    CreatedAt DATETIME2 NOT NULL,
    IsRead BIT NOT NULL
);

-- =============================================
-- Phase 2 Tables[cite: 6]
-- =============================================

CREATE TABLE AdminUsers (
    AdminId INT IDENTITY(1,1) PRIMARY KEY,
    Username NVARCHAR(60) NOT NULL,
    PasswordHash NVARCHAR(256) NOT NULL,
    Role NVARCHAR(30) NOT NULL,
    IsActive BIT NOT NULL
);

CREATE TABLE Teams (
    TeamId INT IDENTITY(1,1) PRIMARY KEY,
    TeamName NVARCHAR(120) NOT NULL,
    Institution NVARCHAR(150) NULL,
    LeaderName NVARCHAR(120) NOT NULL,
    LeaderEmail NVARCHAR(150) NOT NULL,
    LeaderPhone NVARCHAR(30) NOT NULL,
    CreatedAt DATETIME2 NOT NULL
);

CREATE TABLE TeamParticipants (
    ParticipantId INT IDENTITY(1,1) PRIMARY KEY,
    TeamId INT NOT NULL REFERENCES Teams (TeamId),
    FullName NVARCHAR(120) NOT NULL,
    Email NVARCHAR(150) NULL,
    CnicOrStudentId NVARCHAR(30) NULL
);

CREATE TABLE Registrations (
    RegistrationId INT IDENTITY(1,1) PRIMARY KEY,
    TeamId INT NOT NULL REFERENCES Teams (TeamId),
    EventId INT NOT NULL REFERENCES Events (EventId),
    Status NVARCHAR(20) NOT NULL,
    PaymentProofUrl NVARCHAR(500) NULL,
    CreatedAt DATETIME2 NOT NULL
);



INSERT INTO EventTiers (TierLevel, Name, Description, DisplayOrder) VALUES
(1, N'Tier 1', N'Flag-Ship', 1),
(2, N'Tier 2', N'Mid-level events', 2),
(3, N'Tier 3', N'Internal events', 3);

select * from EventTiers



USE NexusDb;
GO

-- =============================================
-- 0. SCHEMA ALTERATIONS FOR FULL PDF COMPLIANCE
-- =============================================

-- Add contact and prize columns to Events table
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Events') AND name = 'ManagerName')
    ALTER TABLE Events ADD ManagerName NVARCHAR(120) NULL;

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Events') AND name = 'ManagerEmail')
    ALTER TABLE Events ADD ManagerEmail NVARCHAR(150) NULL;

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Events') AND name = 'ManagerPhone')
    ALTER TABLE Events ADD ManagerPhone NVARCHAR(30) NULL;

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Events') AND name = 'WinnerPrize')
    ALTER TABLE Events ADD WinnerPrize NVARCHAR(100) NULL;

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Events') AND name = 'RunnerUpPrize')
    ALTER TABLE Events ADD RunnerUpPrize NVARCHAR(100) NULL;

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Events') AND name = 'PrizePool')
    ALTER TABLE Events ADD PrizePool NVARCHAR(100) NULL;

-- Ensure FestInfo has all core team contact fields
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('FestInfo') AND name = 'ExecutiveHead')
    ALTER TABLE FestInfo ADD ExecutiveHead NVARCHAR(120) NULL;

GO

-- =============================================
-- 1. SEED FEST INFO (BIIT Nexus Strategy Manual)
-- =============================================
INSERT INTO FestInfo (
    Name, Tagline, Description, StartDate, EndDate, VenueSummary, 
    ContactEmail, ContactPhone, ExecutiveHead
) VALUES (
    N'BIIT Nexus 2026', 
    N'Climate Resilience & Sustainability', 
    N'A 5-day inter-university regional festival transitioning from campus Techfest to a unified regional event. Features a 10-15% climate relevance weighting across flagship rubrics.', 
    '2026-11-01 09:00:00', 
    '2026-11-05 18:00:00', 
    N'BIIT Campus & Off-site Venues', 
    N'info@biitnexus.edu.pk', 
    N'+92-51-111-222-333',
    N'Abdullah Khan'
);

-- =============================================
-- 2. SEED EVENT CATEGORIES
-- =============================================
INSERT INTO EventCategories (Name, Slug, IconName, DisplayOrder) VALUES
(N'Programming & Software', N'programming-software', N'code', 1),
(N'AI & Security', N'ai-security', N'cpu', 2),
(N'Mathematics & Logic', N'mathematics-logic', N'calculator', 3),
(N'Gaming & Game Dev', N'gaming-game-dev', N'gamepad', 4),
(N'Sports', N'sports', N'activity', 5),
(N'Islamic & Knowledge', N'islamic-knowledge', N'book', 6),
(N'Cultural & Arts', N'cultural-arts', N'music', 7);

-- =============================================
-- 3. SEED TEAM MEMBERS (Executive Council & Leads)
-- =============================================
INSERT INTO TeamMembers (FullName, Role, Department, DisplayOrder) VALUES
(N'Abdullah Khan', N'Executive Head', N'Executive Council', 1),
(N'Saim Iftikhar', N'Executive Council Member', N'Executive Council', 2),
(N'Abdul Wasay', N'Executive Council Member', N'Executive Council', 3),
(N'Syed Saad Hassan', N'Executive Council Member', N'Executive Council', 4),
(N'M Mujtaba', N'Executive Council Member', N'Executive Council', 5),
(N'Muhammad Usman Kiani', N'Executive Council Member', N'Executive Council', 6),
(N'M. Maarij', N'Management Lead', N'Management', 7),
(N'Muskan', N'Media Lead', N'Media', 8),
(N'Tayyaba Kousar', N'Logistics Lead', N'Logistics', 9),
(N'Raja Mukaram', N'Operations Lead', N'Operations', 10),
(N'Zargham', N'Graphics Lead', N'Graphics', 11),
(N'Ayesha Kiyani', N'Volunteers Lead', N'Volunteers', 12),
(N'Talal Kiyani', N'PR & Marketing Lead', N'PR & Marketing', 13),
(N'M. Afaq Saim', N'Security Lead', N'Security', 14),
(N'Abdul Subhan', N'Sponsorship & Liaison Lead', N'Sponsorship Council', 15),
(N'Summiya Shakeel', N'Lead General Secretary', N'Secretariat', 16);

-- =============================================
-- 4. SEED EVENTS
-- =============================================

-- --- PROGRAMMING & SOFTWARE EVENTS ---

-- Code Relay
INSERT INTO Events (
    TierId, CategoryId, Title, Slug, ShortSummary, Description, 
    MinTeamSize, MaxTeamSize, EntryFee, 
    IsFeatured, IsActive, CreatedAt
)
VALUES (
    (SELECT TierId FROM EventTiers WHERE TierLevel = 1), 
    1, 
    N'Code Relay', 
    N'code-relay', 
    N'A 4-member team relay coding challenge on task scheduling with circular dependency detection.', 
    N'Teammates take turns coding in blind, strictly-timed 5-minute turns with zero verbal communication allowed between hand-offs. Together, the team must build a working task scheduler that detects circular dependencies, produces a valid execution order, and computes a project''s critical path using CPM.', 
    4, 4, 1500.00, 
    0, 1, SYSUTCDATETIME()
);

-- Debug the Disaster
INSERT INTO Events (
    TierId, CategoryId, Title, Slug, ShortSummary, Description, 
    MinTeamSize, MaxTeamSize, EntryFee, 
    IsFeatured, IsActive, CreatedAt
)
VALUES (
    (SELECT TierId FROM EventTiers WHERE TierLevel = 2), 
    1, 
    N'Debug the Disaster', 
    N'debug-the-disaster', 
    N'Identify, fix, and document 8 injected bugs in a Python Library Management System.', 
    N'Hands every team the identical, deliberately broken Library Management System written in Python with 8 injected bugs ranging from simple logic errors to an advanced-level Python trap. Teams must diagnose, fix, and document every bug.', 
    4, 4, 1200.00, 
    0, 1, SYSUTCDATETIME()
);

-- Insert coordinator details into EventCoordinators
INSERT INTO EventCoordinators (EventId, FullName, Email, Phone)
VALUES (
    (SELECT EventId FROM Events WHERE Slug = 'debug-the-disaster'),
    N'Nizhat Imtiaz',
    N'nizhatwork1@gmail.com',
    N'03165621069'
);

-- Protocol: Zero (Speed Programming)
INSERT INTO Events (
    TierId, CategoryId, Title, Slug, ShortSummary, Description, 
    MinTeamSize, MaxTeamSize, EntryFee, 
    IsFeatured, IsActive, CreatedAt
)
VALUES (
    (SELECT TierId FROM EventTiers WHERE TierLevel = 1), 
    1, 
    N'Protocol: Zero - Speed Programming', 
    N'protocol-zero', 
    N'Inter-university speed programming competition across 4 progressive algorithmic rounds on HackerRank.', 
    N'Challenges students through algorithmic problem-solving tasks across four progressive rounds, solving problems involving data structures, algorithms, optimization, and logical thinking under time constraints.', 
    1, 3, 1500.00, 
    0, 1, SYSUTCDATETIME()
);

-- Insert coordinator details into EventCoordinators
INSERT INTO EventCoordinators (EventId, FullName, Email, Phone)
VALUES (
    (SELECT EventId FROM Events WHERE Slug = 'protocol-zero'),
    N'Muhammad Usman',
    N'ukiyani768@gmail.com',
    N'03115347467'
);
USE NexusDb;
GO

-- =============================================
-- PROGRAMMING & SOFTWARE EVENTS
-- =============================================

-- Application Development Competition
INSERT INTO Events (
    TierId, CategoryId, Title, Slug, ShortSummary, Description, 
    MinTeamSize, MaxTeamSize, EntryFee, IsFeatured, IsActive, CreatedAt
)
VALUES (
    (SELECT TierId FROM EventTiers WHERE TierLevel = 1), 1, 
    N'Application Development Competition', N'application-development', 
    N'Turn a problem statement or application idea into a fully working hosted application within event timeframe.', 
    N'Teams receive a problem statement at the start and must build a working application using any technology stack, framework, or database. Must submit source code and live hosted link.', 
    3, 5, 2000.00, 0, 1, SYSUTCDATETIME()
);

INSERT INTO EventCoordinators (EventId, FullName, Email, Phone)
VALUES (
    (SELECT EventId FROM Events WHERE Slug = 'application-development'),
    N'Zia Un Noor', N'nnoorr0625@gmail.com', N'03199976313'
);


-- =============================================
-- AI & SECURITY EVENTS
-- =============================================

-- AI Neural Lock
INSERT INTO Events (
    TierId, CategoryId, Title, Slug, ShortSummary, Description, 
    MinTeamSize, MaxTeamSize, EntryFee, IsFeatured, IsActive, CreatedAt
)
VALUES (
    (SELECT TierId FROM EventTiers WHERE TierLevel = 2), 2, 
    N'AI Neural Lock: Escape the System', N'ai-neural-lock', 
    N'Three-stage AI competition: Prompt Engineering, Coding Challenge, and Debugging Challenge.', 
    N'Teams are trapped inside a fictional AI-controlled system. To escape, they must break through three Neural Locks testing Prompt Engineering/Reasoning, Coding, and System Debugging.', 
    2, 3, 1500.00, 0, 1, SYSUTCDATETIME()
);

INSERT INTO EventCoordinators (EventId, FullName, Email, Phone)
VALUES (
    (SELECT EventId FROM Events WHERE Slug = 'ai-neural-lock'),
    N'Nadiha', N'2025-arid-0177@biit.edu.pk', N'03445961797'
);

-- Operation Tipping Point
INSERT INTO Events (
    TierId, CategoryId, Title, Slug, ShortSummary, Description, 
    MinTeamSize, MaxTeamSize, EntryFee, PrizeInfo, IsFeatured, IsActive, CreatedAt
)
VALUES (
    (SELECT TierId FROM EventTiers WHERE TierLevel = 1), 2, 
    N'Operation Tipping Point: Climate Forensics', N'operation-tipping-point', 
    N'150-minute climate forensics challenge combining SQL audit logs, Python sensor cleaning, and cryptography.', 
    N'Investigate a breach at South Asia Observatory Network. Round 1 uses SQL audit logs, Round 2 cleans Python sensor logs, Round 3 decrypts ciphers, and Round 4 computes the final code from climate data.', 
    2, 3, 1500.00, N'Prize Pool: 40,000 PKR (Winner: 25,000 / Runner-Up: 15,000)', 0, 1, SYSUTCDATETIME()
);

INSERT INTO EventCoordinators (EventId, FullName, Email, Phone)
VALUES (
    (SELECT EventId FROM Events WHERE Slug = 'operation-tipping-point'),
    N'Saad Abdullah Shahzad', N'docs.saad@gmail.com', N'03335639776'
);

-- Resilience Nexus (AI)
INSERT INTO Events (
    TierId, CategoryId, Title, Slug, ShortSummary, Description, 
    MinTeamSize, MaxTeamSize, EntryFee, IsFeatured, IsActive, CreatedAt
)
VALUES (
    (SELECT TierId FROM EventTiers WHERE TierLevel = 1), 2, 
    N'Resilience Nexus (AI)', N'resilience-nexus-ai', 
    N'Flagship AI competition on deforestation detection, flood forecasting, and interactive local GUI packaging.', 
    N'Teams tackle environmental challenges in South Asia using satellite and climate datasets over 3 rounds. Models must generalize to unseen regions and be packaged into a local interactive GUI.', 
    2, 3, 2000.00, 0, 1, SYSUTCDATETIME()
);

INSERT INTO EventCoordinators (EventId, FullName, Email, Phone)
VALUES (
    (SELECT EventId FROM Events WHERE Slug = 'resilience-nexus-ai'),
    N'Muhammad Sheraz', N'sherazalvi142@gmail.com', N'03214172142'
);


-- =============================================
-- MATHEMATICS & LOGIC EVENTS
-- =============================================

-- MINDX-Mathematics
INSERT INTO Events (
    TierId, CategoryId, Title, Slug, ShortSummary, Description, 
    MinTeamSize, MaxTeamSize, EntryFee, IsFeatured, IsActive, CreatedAt
)
VALUES (
    (SELECT TierId FROM EventTiers WHERE TierLevel = 3), 3, 
    N'MINDX - Mathematics', N'mindx-mathematics', 
    N'Fast-paced knowledge test with 50 numerical and logic MCQs in 50 minutes with negative marking.', 
    N'High-pressure numerical and logic test containing 50 questions requiring rapid problem-solving across core math subjects and analytical reasoning.', 
    1, 1, 500.00, 0, 1, SYSUTCDATETIME()
);

INSERT INTO EventCoordinators (EventId, FullName, Email, Phone)
VALUES (
    (SELECT EventId FROM Events WHERE Slug = 'mindx-mathematics'),
    N'Ume Tayyaba', N'umetayyaba17@gmail.com', N'03455008027'
);

-- The Turing Trap (Escape Room)
INSERT INTO Events (
    TierId, CategoryId, Title, Slug, ShortSummary, Description, 
    MinTeamSize, MaxTeamSize, EntryFee, IsFeatured, IsActive, CreatedAt
)
VALUES (
    (SELECT TierId FROM EventTiers WHERE TierLevel = 2), 3, 
    N'The Turing Trap (Escape Room)', N'the-turing-trap', 
    N'Immersive physical room puzzle with mathematical, algorithmic, and cryptographic lockboxes.', 
    N'Participants are locked in a room and must work collaboratively to solve interconnected mathematical, algorithmic, and cryptographic puzzles to obtain physical combination lockbox codes.', 
    2, 4, 1500.00, 0, 1, SYSUTCDATETIME()
);

INSERT INTO EventCoordinators (EventId, FullName, Email, Phone)
VALUES (
    (SELECT EventId FROM Events WHERE Slug = 'the-turing-trap'),
    N'Abdul Rehman', N'abdurahmansami7@gmail.com', N'03311200207'
);

-- Build Your Own Algorithm Challenge
INSERT INTO Events (
    TierId, CategoryId, Title, Slug, ShortSummary, Description, 
    MinTeamSize, MaxTeamSize, EntryFee, IsFeatured, IsActive, CreatedAt
)
VALUES (
    (SELECT TierId FROM EventTiers WHERE TierLevel = 2), 3, 
    N'Build Your Own Algorithm Challenge', N'build-your-own-algorithm', 
    N'Design an optimized pathfinding and load-balancing algorithm for a multi-node network failure.', 
    N'Evaluate a simulated multi-node network failure case study, write an algorithm to reroute traffic under constraints, perform time-complexity analysis, and defend the solution orally before judges.', 
    1, 3, 1000.00, 0, 1, SYSUTCDATETIME()
);

INSERT INTO EventCoordinators (EventId, FullName, Email, Phone)
VALUES (
    (SELECT EventId FROM Events WHERE Slug = 'build-your-own-algorithm'),
    N'Qazi Huzaifa', N'qazihuzaifa302@gmail.com', N'03493755894'
);


-- =============================================
-- GAMING & CULTURAL EVENTS
-- =============================================

-- Discord Couch Party Game Jam
INSERT INTO Events (
    TierId, CategoryId, Title, Slug, ShortSummary, Description, 
    MinTeamSize, MaxTeamSize, EntryFee, IsFeatured, IsActive, CreatedAt
)
VALUES (
    (SELECT TierId FROM EventTiers WHERE TierLevel = 1), 4, 
    N'Discord Couch Party Game Jam', N'discord-couch-party-game-jam', 
    N'3-day game development jam based on a secret theme announced on Day 1.', 
    N'Participants design and develop an original playable game based on an unannounced theme. Runs over 3 days with on-campus activity and home development, ending in a live presentation.', 
    1, 5, 2500.00, 0, 1, SYSUTCDATETIME()
);

INSERT INTO EventCoordinators (EventId, FullName, Email, Phone)
VALUES (
    (SELECT EventId FROM Events WHERE Slug = 'discord-couch-party-game-jam'),
    N'Muhammad Mujtaba', N'mujtaba.office.mail@gmail.com', N'03255468113'
);

-- Singing Competition With Track
INSERT INTO Events (
    TierId, CategoryId, Title, Slug, ShortSummary, Description, 
    DurationText, MinTeamSize, MaxTeamSize, EntryFee, IsFeatured, IsActive, CreatedAt
)
VALUES (
    (SELECT TierId FROM EventTiers WHERE TierLevel = 3), 7, 
    N'Singing Competition With Track', N'singing-competition', 
    N'Individual Urdu song performance with compulsory track execution.', 
    N'Participants perform an Urdu song individually with a track. Judged on Vocal Quality, Sur & Rhythm, Track Synchronization, Urdu Pronunciation, and Stage Performance (10 marks each).', 
    N'5-7 minutes', 1, 1, 500.00, 0, 1, SYSUTCDATETIME()
);

INSERT INTO EventCoordinators (EventId, FullName, Email, Phone)
VALUES (
    (SELECT EventId FROM Events WHERE Slug = 'singing-competition'),
    N'Cultural Society Lead', NULL, NULL
);

-- Skit Competition
INSERT INTO Events (
    TierId, CategoryId, Title, Slug, ShortSummary, Description, 
    DurationText, MinTeamSize, MaxTeamSize, EntryFee, IsFeatured, IsActive, CreatedAt
)
VALUES (
    (SELECT TierId FROM EventTiers WHERE TierLevel = 3), 7, 
    N'Skit Competition', N'skit-competition', 
    N'Group drama-style skit without vulgarity, judged on acting and story.', 
    N'Group drama-style skit performance. Judged on Acting, Story & Dialogue, Teamwork, Stage Performance, and Audience Engagement (10 marks each).', 
    N'7-10 minutes', 2, 5, 1000.00, 0, 1, SYSUTCDATETIME()
);

INSERT INTO EventCoordinators (EventId, FullName, Email, Phone)
VALUES (
    (SELECT EventId FROM Events WHERE Slug = 'skit-competition'),
    N'Cultural Society Lead', NULL, NULL
);

-- Cooking Competition
INSERT INTO Events (
    TierId, CategoryId, Title, Slug, ShortSummary, Description, 
    DurationText, MinTeamSize, MaxTeamSize, EntryFee, IsFeatured, IsActive, CreatedAt
)
VALUES (
    (SELECT TierId FROM EventTiers WHERE TierLevel = 3), 7, 
    N'Cooking Competition (Chicken Biryani)', N'cooking-competition', 
    N'Prepare Chicken Biryani live with 1 chef and up to 2 helpers.', 
    N'Participants prepare Chicken Biryani bringing their own ingredients, utensils, and cylinder. Judged on Taste, Presentation, Cleanliness, Time Management, and Creativity (10 marks each).', 
    N'2.5 - 3 hours', 1, 3, 1500.00, 0, 1, SYSUTCDATETIME()
);

INSERT INTO EventCoordinators (EventId, FullName, Email, Phone)
VALUES (
    (SELECT EventId FROM Events WHERE Slug = 'cooking-competition'),
    N'Cultural Society Lead', NULL, NULL
);

-- Stand Up Comedy Competition
INSERT INTO Events (
    TierId, CategoryId, Title, Slug, ShortSummary, Description, 
    DurationText, MinTeamSize, MaxTeamSize, EntryFee, IsFeatured, IsActive, CreatedAt
)
VALUES (
    (SELECT TierId FROM EventTiers WHERE TierLevel = 3), 7, 
    N'Stand Up Comedy Competition', N'standup-comedy', 
    N'Individual Urdu stand-up comedy performance.', 
    N'Individual comedy performance primarily in Urdu with slight English allowed. Judged on Content & Humour, Confidence, Urdu Delivery, Audience Engagement, and Time Management.', 
    N'5-8 minutes', 1, 1, 500.00, 0, 1, SYSUTCDATETIME()
);

INSERT INTO EventCoordinators (EventId, FullName, Email, Phone)
VALUES (
    (SELECT EventId FROM Events WHERE Slug = 'standup-comedy'),
    N'Cultural Society Lead', NULL, NULL
);

-- Cultural Stall Competition
INSERT INTO Events (
    TierId, CategoryId, Title, Slug, ShortSummary, Description, 
    DurationText, MinTeamSize, MaxTeamSize, EntryFee, IsFeatured, IsActive, CreatedAt
)
VALUES (
    (SELECT TierId FROM EventTiers WHERE TierLevel = 3), 7, 
    N'Cultural Stall Competition', N'cultural-stall', 
    N'Group stall representing cultural themes and heritage decoration.', 
    N'Groups represent a culture through stall decoration in provided space. Judged on Cultural Representation, Decoration, Creativity, Presentation, and Teamwork.', 
    N'4 hours', 4, 5, 1000.00, 0, 1, SYSUTCDATETIME()
);

INSERT INTO EventCoordinators (EventId, FullName, Email, Phone)
VALUES (
    (SELECT EventId FROM Events WHERE Slug = 'cultural-stall'),
    N'Cultural Society Lead', NULL, NULL
);


-- =============================================
-- ISLAMIC KNOWLEDGE EVENTS
-- =============================================

-- Seerat Escape Room
INSERT INTO Events (
    TierId, CategoryId, Title, Slug, ShortSummary, Description, 
    MinTeamSize, MaxTeamSize, EntryFee, PrizeInfo, IsFeatured, IsActive, CreatedAt
)
VALUES (
    (SELECT TierId FROM EventTiers WHERE TierLevel = 2), 6, 
    N'Seerat Escape Room Competition', N'seerat-escape-room', 
    N'Decipher Seerat-based clues and unlock lockboxes within 45 to 100 minutes.', 
    N'Interactive team event in a decorated escape room. Decipher Seerat-un-Nabi clues, unlock sequential lockboxes, and escape. Electronic devices strictly prohibited. Max 2 hints with 3-min penalties.', 
    3, 4, 2500.00, N'Prize Pool: 55,000 PKR (Winner: 30,000 / Runner-Up: 25,000)', 0, 1, SYSUTCDATETIME()
);

INSERT INTO EventCoordinators (EventId, FullName, Email, Phone)
VALUES (
    (SELECT EventId FROM Events WHERE Slug = 'seerat-escape-room'),
    N'Muhammad Aftab Nisar', N'raoaftab0325@gmail.com', N'03019014205'
);

-- Naat & Qirat Competition
INSERT INTO Events (
    TierId, CategoryId, Title, Slug, ShortSummary, Description, 
    MinTeamSize, MaxTeamSize, EntryFee, PrizeInfo, IsFeatured, IsActive, CreatedAt
)
VALUES (
    (SELECT TierId FROM EventTiers WHERE TierLevel = 3), 6, 
    N'Naat & Qirat Competition', N'naat-and-qirat', 
    N'Individual 3-5 minute recitation of Quranic Tajweed and A Cappella Naat Shareef.', 
    N'Qirat focuses on Surah Al-Rahman/Al-Fath with Tajweed. Naat features A Cappella performance on Seerat-e-Tayyaba without instruments/tracks. Independent prizes for both categories.', 
    1, 1, 1000.00, N'Prize Pool: 60,000 PKR Total (Naat/Qirat Winner: 20,000 each / Runner-Up: 10,000 each)', 0, 1, SYSUTCDATETIME()
);

INSERT INTO EventCoordinators (EventId, FullName, Email, Phone)
VALUES (
    (SELECT EventId FROM Events WHERE Slug = 'naat-and-qirat'),
    N'Syed Muhammad Ali', NULL, N'03231595450'
);

-- Seerat Quiz Competition
INSERT INTO Events (
    TierId, CategoryId, Title, Slug, ShortSummary, Description, 
    MinTeamSize, MaxTeamSize, EntryFee, PrizeInfo, IsFeatured, IsActive, CreatedAt
)
VALUES (
    (SELECT TierId FROM EventTiers WHERE TierLevel = 3), 6, 
    N'Seerat Quiz Competition', N'seerat-quiz', 
    N'Closed-book web application assessment of 50 MCQs in 30 minutes on distributed material.', 
    N'Individual knowledge assessment on Prophet Muhammad (PBUH) life and milestones. Conducted via custom web app with 50 MCQs in a strict 30-minute auto-submitting countdown without negative marking.', 
    1, 1, 1000.00, N'Prize Pool: 30,000 PKR (Winner: 20,000 / Runner-Up: 10,000)', 0, 1, SYSUTCDATETIME()
);

INSERT INTO EventCoordinators (EventId, FullName, Email, Phone)
VALUES (
    (SELECT EventId FROM Events WHERE Slug = 'seerat-quiz'),
    N'Syed Muhammad Iqyan Ali Naqvi', N'iqyanshah165@gmail.com', N'03256432091'
);


-- =============================================
-- SPORTS EVENTS
-- =============================================

-- Futsal
INSERT INTO Events (
    TierId, CategoryId, Title, Slug, ShortSummary, Description, 
    MinTeamSize, MaxTeamSize, EntryFee, PrizeInfo, IsFeatured, IsActive, CreatedAt
)
VALUES (
    (SELECT TierId FROM EventTiers WHERE TierLevel = 2), 5, 
    N'Futsal Tournament', N'futsal-tournament', 
    N'Boys team-based single-elimination futsal knockout tournament (16 teams).', 
    N'16-team single-elimination tournament with 15 total matches. 5 players on field + up to 3 substitutes per team. 20-minute halves.', 
    5, 8, 5000.00, N'Prize Pool: 70,000 PKR (Winner: 50,000 / Runner-Up: 20,000)', 0, 1, SYSUTCDATETIME()
);

INSERT INTO EventCoordinators (EventId, FullName, Email, Phone)
VALUES (
    (SELECT EventId FROM Events WHERE Slug = 'futsal-tournament'),
    N'Ehtisam Nadir', N'ehtisam19@gmail.com', N'03305374422'
);

-- Chess
INSERT INTO Events (
    TierId, CategoryId, Title, Slug, ShortSummary, Description, 
    MinTeamSize, MaxTeamSize, EntryFee, PrizeInfo, IsFeatured, IsActive, CreatedAt
)
VALUES (
    (SELECT TierId FROM EventTiers WHERE TierLevel = 3), 5, 
    N'Chess Tournament', N'chess-tournament', 
    N'Mixed individual 7-round Swiss-system chess tournament under FIDE rules.', 
    N'7-round Swiss system tournament open to all participating students. Enforces FIDE rules and touch-move policy.', 
    1, 1, 500.00, N'Prize Pool: 15,000 PKR (Winner: 10,000 / Runner-Up: 5,000)', 0, 1, SYSUTCDATETIME()
);

INSERT INTO EventCoordinators (EventId, FullName, Email, Phone)
VALUES (
    (SELECT EventId FROM Events WHERE Slug = 'chess-tournament'),
    N'Muhammad Fasih Yaseen', N'fasihyaseen250@gmail.com', N'03379251535'
);

-- Table Tennis
INSERT INTO Events (
    TierId, CategoryId, Title, Slug, ShortSummary, Description, 
    MinTeamSize, MaxTeamSize, EntryFee, PrizeInfo, IsFeatured, IsActive, CreatedAt
)
VALUES (
    (SELECT TierId FROM EventTiers WHERE TierLevel = 3), 5, 
    N'Table Tennis Singles', N'table-tennis-singles', 
    N'Separate boys and girls singles single-elimination table tennis brackets.', 
    N'1v1 singles matches across distinct boys'' and girls'' brackets using single-elimination format.', 
    1, 1, 500.00, N'Prize Pool: 30,000 PKR Total (Winner: 10,000 / Runner-Up: 5,000 per bracket)', 0, 1, SYSUTCDATETIME()
);

INSERT INTO EventCoordinators (EventId, FullName, Email, Phone)
VALUES (
    (SELECT EventId FROM Events WHERE Slug = 'table-tennis-singles'),
    N'Zakariya Umar', N'zakariyaumar007@gmail.com', N'03405561259'
);

-- Arm Wrestling
INSERT INTO Events (
    TierId, CategoryId, Title, Slug, ShortSummary, Description, 
    MinTeamSize, MaxTeamSize, EntryFee, PrizeInfo, IsFeatured, IsActive, CreatedAt
)
VALUES (
    (SELECT TierId FROM EventTiers WHERE TierLevel = 3), 5, 
    N'Arm Wrestling Competition', N'arm-wrestling', 
    N'Boys arm wrestling in 3 weight classes: Under 65kg, Under 80kg, and Under 100kg.', 
    N'Best of 3 rounds single-elimination tournament divided into Under 65 kg, Under 80 kg, and Under 100 kg weight classes. Official weigh-ins on event day.', 
    1, 1, 500.00, N'Prize Pool: 45,000 PKR Total (Winner: 10,000 / Runner-Up: 5,000 per weight class)', 0, 1, SYSUTCDATETIME()
);

INSERT INTO EventCoordinators (EventId, FullName, Email, Phone)
VALUES (
    (SELECT EventId FROM Events WHERE Slug = 'arm-wrestling'),
    N'Abdul Arham', N'arhamabdul327@gmail.com', N'03239395089'
);

-- Ludo
INSERT INTO Events (
    TierId, CategoryId, Title, Slug, ShortSummary, Description, 
    MinTeamSize, MaxTeamSize, EntryFee, PrizeInfo, IsFeatured, IsActive, CreatedAt
)
VALUES (
    (SELECT TierId FROM EventTiers WHERE TierLevel = 3), 5, 
    N'Ludo Competition', N'ludo-competition', 
    N'Mixed duo-based knockout Ludo tournament on standard boards.', 
    N'Duo-based knockout tournament using standard 4-token Ludo rules with safe zones and mandatory 6 to exit base.', 
    2, 2, 500.00, N'Prize Pool: 15,000 PKR (Winner: 10,000 / Runner-Up: 5,000)', 0, 1, SYSUTCDATETIME()
);

INSERT INTO EventCoordinators (EventId, FullName, Email, Phone)
VALUES (
    (SELECT EventId FROM Events WHERE Slug = 'ludo-competition'),
    N'Saad Abdullah Shahzad', N'info.saadsh@gmail.com', N'03335639776'
);
GO
-- =============================================
-- 5. SEED EVENT RULES
-- =============================================

-- Code Relay Rules
INSERT INTO EventRules (EventId, RuleText, DisplayOrder)
SELECT EventId, N'Teams must have exactly 4 members; one person codes at a time.', 1 FROM Events WHERE Slug = 'code-relay' UNION ALL
SELECT EventId, N'Each turn is strictly 5 minutes; the coder must step away the instant the timer ends.', 2 FROM Events WHERE Slug = 'code-relay' UNION ALL
SELECT EventId, N'No talking, messaging, or note-passing about code during turns. Only code comments carry information.', 3 FROM Events WHERE Slug = 'code-relay' UNION ALL
SELECT EventId, N'No AI/LLM tools of any kind allowed.', 4 FROM Events WHERE Slug = 'code-relay' UNION ALL
SELECT EventId, N'Python 3.10+ standard library only; no external packages or internet access.', 5 FROM Events WHERE Slug = 'code-relay';

-- Debug the Disaster Rules
INSERT INTO EventRules (EventId, RuleText, DisplayOrder)
SELECT EventId, N'Teams must have exactly 4 members operating on an identical codebase.', 1 FROM Events WHERE Slug = 'debug-the-disaster' UNION ALL
SELECT EventId, N'Python 3 only; original program structure and function names must stay intact.', 2 FROM Events WHERE Slug = 'debug-the-disaster' UNION ALL
SELECT EventId, N'No AI/LLM tools allowed. Internet allowed ONLY for official Python documentation.', 3 FROM Events WHERE Slug = 'debug-the-disaster' UNION ALL
SELECT EventId, N'A complete bug log must be submitted alongside the fixed code.', 4 FROM Events WHERE Slug = 'debug-the-disaster';

-- Operation Tipping Point Rules
INSERT INTO EventRules (EventId, RuleText, DisplayOrder)
SELECT EventId, N'Teams of 2-3 members complete 4 sequential rounds (SQL, Python, Cryptography, SQL) in 150 minutes.', 1 FROM Events WHERE Slug = 'operation-tipping-point' UNION ALL
SELECT EventId, N'No AI tools (ChatGPT, Copilot, etc.) or internet access permitted.', 2 FROM Events WHERE Slug = 'operation-tipping-point' UNION ALL
SELECT EventId, N'Skeleton keys can be requested when stuck at the cost of remaining round points.', 3 FROM Events WHERE Slug = 'operation-tipping-point';

-- Seerat Escape Room Rules
INSERT INTO EventRules (EventId, RuleText, DisplayOrder)
SELECT EventId, N'Team size strictly 3-4 members. No individual entries allowed.', 1 FROM Events WHERE Slug = 'seerat-escape-room' UNION ALL
SELECT EventId, N'All electronic devices (phones, smartwatches) prohibited inside and surrendered before entry.', 2 FROM Events WHERE Slug = 'seerat-escape-room' UNION ALL
SELECT EventId, N'Maximum 2 hints allowed per run. Each requested hint adds a 3-minute penalty.', 3 FROM Events WHERE Slug = 'seerat-escape-room' UNION ALL
SELECT EventId, N'Time window: 45 to 100 minutes. Single attempt limit.', 4 FROM Events WHERE Slug = 'seerat-escape-room';

-- Naat & Qirat Rules
INSERT INTO EventRules (EventId, RuleText, DisplayOrder)
SELECT EventId, N'Individual participation only; spot registration prohibited.', 1 FROM Events WHERE Slug = 'naat-and-qirat' UNION ALL
SELECT EventId, N'Time window strictly 3-5 minutes per participant.', 2 FROM Events WHERE Slug = 'naat-and-qirat' UNION ALL
SELECT EventId, N'A Cappella Naat only: musical instruments and audio accompaniments strictly forbidden.', 3 FROM Events WHERE Slug = 'naat-and-qirat';

-- Seerat Quiz Rules
INSERT INTO EventRules (EventId, RuleText, DisplayOrder)
SELECT EventId, N'Closed-book test: no secondary devices, tab-switching, or internet searching.', 1 FROM Events WHERE Slug = 'seerat-quiz' UNION ALL
SELECT EventId, N'50 MCQs must be completed within non-pausable 30-minute limit on custom web application.', 2 FROM Events WHERE Slug = 'seerat-quiz' UNION ALL
SELECT EventId, N'No negative marking for wrong or unattempted answers.', 3 FROM Events WHERE Slug = 'seerat-quiz';

-- Futsal Rules
INSERT INTO EventRules (EventId, RuleText, DisplayOrder)
SELECT EventId, N'Single-elimination knockout format across 16 teams.', 1 FROM Events WHERE Slug = 'futsal-tournament' UNION ALL
SELECT EventId, N'5 players on field + up to 3 substitutes. Roster finalized before first match.', 2 FROM Events WHERE Slug = 'futsal-tournament' UNION ALL
SELECT EventId, N'Walkover awarded if team fails to appear within 10 minutes of scheduled start.', 3 FROM Events WHERE Slug = 'futsal-tournament';

-- Cooking Rules
INSERT INTO EventRules (EventId, RuleText, DisplayOrder)
SELECT EventId, N'1 chef with maximum 2 helpers preparing Chicken Biryani.', 1 FROM Events WHERE Slug = 'cooking-competition' UNION ALL
SELECT EventId, N'Participants bring all requirements: ingredients, utensils, and gas cylinder.', 2 FROM Events WHERE Slug = 'cooking-competition';

-- =============================================
-- 6. SEED EVENT COORDINATORS
-- =============================================

INSERT INTO EventCoordinators (EventId, FullName, Phone, Email)
SELECT EventId, N'Nizhat Imtiaz', N'+92 316 5621069', N'nizhatwork1@gmail.com' FROM Events WHERE Slug = 'debug-the-disaster' UNION ALL
SELECT EventId, N'Muhammad Usman', N'03115347467', N'ukiyani768@gmail.com' FROM Events WHERE Slug = 'protocol-zero' UNION ALL
SELECT EventId, N'Zia Un Noor', N'03199976313', N'nnoorr0625@gmail.com' FROM Events WHERE Slug = 'application-development' UNION ALL
SELECT EventId, N'Nadiha', N'03445961797', N'2025-arid-0177@biit.edu.pk' FROM Events WHERE Slug = 'ai-neural-lock' UNION ALL
SELECT EventId, N'Saad Abdullah Shahzad', N'03335639776', N'docs.saad@gmail.com' FROM Events WHERE Slug = 'operation-tipping-point' UNION ALL
SELECT EventId, N'Muhammad Sheraz', N'+92 321 4172142', N'sherazalvi142@gmail.com' FROM Events WHERE Slug = 'resilience-nexus-ai' UNION ALL
SELECT EventId, N'Ume Tayyaba', N'03455008027', N'umetayyaba17@gmail.com' FROM Events WHERE Slug = 'mindx-mathematics' UNION ALL
SELECT EventId, N'Abdul Rehman', N'03311200207', N'abdurahmansami7@gmail.com' FROM Events WHERE Slug = 'the-turing-trap' UNION ALL
SELECT EventId, N'Qazi Huzaifa', N'03493755894', N'qazihuzaifa302@gmail.com' FROM Events WHERE Slug = 'build-your-own-algorithm' UNION ALL
SELECT EventId, N'Muhammad Mujtaba', N'03255468113', N'mujtaba.office.mail@gmail.com' FROM Events WHERE Slug = 'discord-couch-party-game-jam' UNION ALL
SELECT EventId, N'Muhammad Aftab Nisar', N'03019014205', N'raoaftab0325@gmail.com' FROM Events WHERE Slug = 'seerat-escape-room' UNION ALL
SELECT EventId, N'Syed Muhammad Ali', N'03231595450', NULL FROM Events WHERE Slug = 'naat-and-qirat' UNION ALL
SELECT EventId, N'Syed Muhammad Iqyan Ali Naqvi', N'+92 325 6432091', N'iqyanshah165@gmail.com' FROM Events WHERE Slug = 'seerat-quiz' UNION ALL
SELECT EventId, N'Ehtisam Nadir', N'03305374422', N'ehtisam19@gmail.com' FROM Events WHERE Slug = 'futsal-tournament' UNION ALL
SELECT EventId, N'Muhammad Fasih Yaseen', N'03379251535', N'fasihyaseen250@gmail.com' FROM Events WHERE Slug = 'chess-tournament' UNION ALL
SELECT EventId, N'Zakariya Umar', N'03405561259', N'zakariyaumar007@gmail.com' FROM Events WHERE Slug = 'table-tennis-singles' UNION ALL
SELECT EventId, N'Abdul Arham', N'03239395089', N'arhamabdul327@gmail.com' FROM Events WHERE Slug = 'arm-wrestling' UNION ALL
SELECT EventId, N'Saad Abdullah Shahzad', N'03335639776', N'info.saadsh@gmail.com' FROM Events WHERE Slug = 'ludo-competition';

-- =============================================
-- 7. SEED FAQS
-- =============================================
INSERT INTO Faqs (Question, Answer, DisplayOrder) VALUES
(N'What is BIIT Nexus 2026?', N'BIIT Nexus is a 5-day regional inter-university festival bringing together technical, creative, and athletic talent under the theme of Climate Resilience & Sustainability.', 1),
(N'Is manual/paper registration allowed?', N'No. All registrations and team sign-ups must be processed online through the official web portal.', 2),
(N'Is there a discount for BIIT students?', N'Yes, all enrolled BIIT students receive an exclusive 50% discount on event registrations.', 3),
(N'How do Campus Ambassador discount codes work?', N'Campus Ambassadors are provided unique promotional codes that grant external participants a 20% discount on event registration.', 4),
(N'How is venue access managed?', N'Upon online registration, participants receive a unique QR code. Scanned QR codes at the gate issue day-specific, color-coded entry wristbands.', 5);


select * from AdminUsers