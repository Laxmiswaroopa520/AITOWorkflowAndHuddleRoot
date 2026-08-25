/* =============================================================================================
   02_Schema_All_Migrations.sql

   The complete database schema: every EF Core migration from InitialCreate through
   AddUserHuddlePlanItemPlacement, in order, as one idempotent script.

   Generated with:
     dotnet ef migrations script --idempotent
       --project AitoWorkflowAndHuddleGenerator.Infrastructure
       --startup-project AitoWorkflowAndHuddleGenerator.Api

   Migrations included:
     20260730090049_InitialCreate
     20260810132816_AddHuddleDomainSchema
     20260811114410_InitialCreate2
     20260811153228_AddPersistentHuddleSessionProgress
     20260814072409_AddUserHuddleLaunchPlans
     20260820131629_NewMigration
     20260821114851_AddUserHuddlePlanItemPlacement

   Creates 33 tables plus __EFMigrationsHistory. Every statement is wrapped in a
   "IF NOT EXISTS in __EFMigrationsHistory" guard, so running it twice is a no-op and running it
   against a partly-migrated database applies only what is missing.

   Do not hand-edit. Change the entity model, add a migration, regenerate.

   NOTE ON THE DATABASE NAME
   This script has no USE statement. Select the target database in SSMS before running it, or add
   a USE line. Script 01 creates AitoWorkflowAndHuddleGeneratorDb, which is the name the workflow
   scripts (10 to 15) expect in their own USE statements.
   ============================================================================================= */

IF OBJECT_ID(N'[__EFMigrationsHistory]') IS NULL
BEGIN
    CREATE TABLE [__EFMigrationsHistory] (
        [MigrationId] nvarchar(150) NOT NULL,
        [ProductVersion] nvarchar(32) NOT NULL,
        CONSTRAINT [PK___EFMigrationsHistory] PRIMARY KEY ([MigrationId])
    );
END;
GO

BEGIN TRANSACTION;
IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260730090049_InitialCreate'
)
BEGIN
    CREATE TABLE [AiTools] (
        [Id] int NOT NULL IDENTITY,
        [ExternalId] nvarchar(100) NOT NULL,
        [Name] nvarchar(150) NOT NULL,
        [Description] nvarchar(1000) NULL,
        [Color] nvarchar(100) NULL,
        [IconKey] nvarchar(100) NULL,
        [SortOrder] int NOT NULL,
        [IsActive] bit NOT NULL,
        [CreatedAtUtc] datetimeoffset NOT NULL,
        [UpdatedAtUtc] datetimeoffset NULL,
        CONSTRAINT [PK_AiTools] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260730090049_InitialCreate'
)
BEGIN
    CREATE TABLE [Roles] (
        [Id] int NOT NULL IDENTITY,
        [ExternalId] nvarchar(50) NOT NULL,
        [Name] nvarchar(150) NOT NULL,
        [Abbreviation] nvarchar(30) NOT NULL,
        [Segment] nvarchar(50) NULL,
        [Description] nvarchar(1000) NULL,
        [SortOrder] int NOT NULL,
        [IsActive] bit NOT NULL,
        [CreatedAtUtc] datetimeoffset NOT NULL,
        [UpdatedAtUtc] datetimeoffset NULL,
        CONSTRAINT [PK_Roles] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260730090049_InitialCreate'
)
BEGIN
    CREATE TABLE [WorkflowBuckets] (
        [Id] int NOT NULL IDENTITY,
        [ExternalId] nvarchar(100) NOT NULL,
        [Name] nvarchar(200) NOT NULL,
        [Description] nvarchar(1000) NULL,
        [SortOrder] int NOT NULL,
        [IsActive] bit NOT NULL,
        [CreatedAtUtc] datetimeoffset NOT NULL,
        [UpdatedAtUtc] datetimeoffset NULL,
        CONSTRAINT [PK_WorkflowBuckets] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260730090049_InitialCreate'
)
BEGIN
    CREATE TABLE [UserWorkflows] (
        [Id] uniqueidentifier NOT NULL,
        [Name] nvarchar(200) NOT NULL,
        [Description] nvarchar(2000) NULL,
        [OwnerObjectId] nvarchar(100) NOT NULL,
        [OwnerEmail] nvarchar(320) NOT NULL,
        [OwnerDisplayName] nvarchar(200) NOT NULL,
        [RoleId] int NOT NULL,
        [TotalDurationMinutes] int NOT NULL,
        [IsFavorite] bit NOT NULL,
        [RowVersion] rowversion NOT NULL,
        [CreatedAtUtc] datetimeoffset NOT NULL,
        [UpdatedAtUtc] datetimeoffset NULL,
        CONSTRAINT [PK_UserWorkflows] PRIMARY KEY ([Id]),
        CONSTRAINT [CK_UserWorkflows_TotalDurationMinutes] CHECK ([TotalDurationMinutes] >= 0),
        CONSTRAINT [FK_UserWorkflows_Roles_RoleId] FOREIGN KEY ([RoleId]) REFERENCES [Roles] ([Id]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260730090049_InitialCreate'
)
BEGIN
    CREATE TABLE [Activities] (
        [Id] int NOT NULL IDENTITY,
        [ExternalId] nvarchar(100) NOT NULL,
        [Title] nvarchar(250) NOT NULL,
        [Description] nvarchar(4000) NULL,
        [RoleId] int NOT NULL,
        [WorkflowBucketId] int NOT NULL,
        [Category] nvarchar(50) NOT NULL,
        [Frequency] nvarchar(50) NOT NULL,
        [Priority] nvarchar(50) NOT NULL,
        [ToolCoverageLevel] nvarchar(50) NOT NULL,
        [TriggerContext] nvarchar(50) NOT NULL,
        [McemStage] nvarchar(50) NOT NULL,
        [DurationMinutes] int NOT NULL,
        [BusinessOutcome] nvarchar(2000) NULL,
        [BeginnerPrompt] nvarchar(max) NULL,
        [AdvancedPrompt] nvarchar(max) NULL,
        [SuggestedOutputs] nvarchar(max) NULL,
        [SortOrder] int NOT NULL,
        [IsActive] bit NOT NULL,
        [CreatedAtUtc] datetimeoffset NOT NULL,
        [UpdatedAtUtc] datetimeoffset NULL,
        CONSTRAINT [PK_Activities] PRIMARY KEY ([Id]),
        CONSTRAINT [CK_Activities_DurationMinutes] CHECK ([DurationMinutes] >= 0),
        CONSTRAINT [FK_Activities_Roles_RoleId] FOREIGN KEY ([RoleId]) REFERENCES [Roles] ([Id]) ON DELETE NO ACTION,
        CONSTRAINT [FK_Activities_WorkflowBuckets_WorkflowBucketId] FOREIGN KEY ([WorkflowBucketId]) REFERENCES [WorkflowBuckets] ([Id]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260730090049_InitialCreate'
)
BEGIN
    CREATE TABLE [WorkflowShares] (
        [Id] uniqueidentifier NOT NULL,
        [UserWorkflowId] uniqueidentifier NOT NULL,
        [RecipientObjectId] nvarchar(100) NOT NULL,
        [RecipientEmail] nvarchar(320) NOT NULL,
        [RecipientDisplayName] nvarchar(200) NOT NULL,
        [SharedByObjectId] nvarchar(100) NOT NULL,
        [SharedByEmail] nvarchar(320) NOT NULL,
        [SharedByDisplayName] nvarchar(200) NOT NULL,
        [Message] nvarchar(2000) NULL,
        [IsRevoked] bit NOT NULL,
        [RevokedAtUtc] datetimeoffset NULL,
        [RowVersion] rowversion NOT NULL,
        [CreatedAtUtc] datetimeoffset NOT NULL,
        [UpdatedAtUtc] datetimeoffset NULL,
        CONSTRAINT [PK_WorkflowShares] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_WorkflowShares_UserWorkflows_UserWorkflowId] FOREIGN KEY ([UserWorkflowId]) REFERENCES [UserWorkflows] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260730090049_InitialCreate'
)
BEGIN
    CREATE TABLE [ActivityAiTools] (
        [ActivityId] int NOT NULL,
        [AiToolId] int NOT NULL,
        [SortOrder] int NOT NULL,
        [IsPrimary] bit NOT NULL,
        CONSTRAINT [PK_ActivityAiTools] PRIMARY KEY ([ActivityId], [AiToolId]),
        CONSTRAINT [FK_ActivityAiTools_Activities_ActivityId] FOREIGN KEY ([ActivityId]) REFERENCES [Activities] ([Id]) ON DELETE CASCADE,
        CONSTRAINT [FK_ActivityAiTools_AiTools_AiToolId] FOREIGN KEY ([AiToolId]) REFERENCES [AiTools] ([Id]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260730090049_InitialCreate'
)
BEGIN
    CREATE TABLE [UserWorkflowActivities] (
        [UserWorkflowId] uniqueidentifier NOT NULL,
        [ActivityId] int NOT NULL,
        [SortOrder] int NOT NULL,
        [AddedAtUtc] datetimeoffset NOT NULL,
        CONSTRAINT [PK_UserWorkflowActivities] PRIMARY KEY ([UserWorkflowId], [ActivityId]),
        CONSTRAINT [FK_UserWorkflowActivities_Activities_ActivityId] FOREIGN KEY ([ActivityId]) REFERENCES [Activities] ([Id]) ON DELETE NO ACTION,
        CONSTRAINT [FK_UserWorkflowActivities_UserWorkflows_UserWorkflowId] FOREIGN KEY ([UserWorkflowId]) REFERENCES [UserWorkflows] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260730090049_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Activities_Category] ON [Activities] ([Category]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260730090049_InitialCreate'
)
BEGIN
    CREATE UNIQUE INDEX [IX_Activities_ExternalId] ON [Activities] ([ExternalId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260730090049_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Activities_McemStage] ON [Activities] ([McemStage]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260730090049_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Activities_Priority] ON [Activities] ([Priority]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260730090049_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Activities_RoleId] ON [Activities] ([RoleId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260730090049_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Activities_RoleId_WorkflowBucketId_IsActive] ON [Activities] ([RoleId], [WorkflowBucketId], [IsActive]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260730090049_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Activities_WorkflowBucketId] ON [Activities] ([WorkflowBucketId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260730090049_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_ActivityAiTools_AiToolId] ON [ActivityAiTools] ([AiToolId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260730090049_InitialCreate'
)
BEGIN
    CREATE UNIQUE INDEX [IX_AiTools_ExternalId] ON [AiTools] ([ExternalId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260730090049_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_AiTools_IsActive_SortOrder] ON [AiTools] ([IsActive], [SortOrder]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260730090049_InitialCreate'
)
BEGIN
    CREATE UNIQUE INDEX [IX_AiTools_Name] ON [AiTools] ([Name]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260730090049_InitialCreate'
)
BEGIN
    CREATE UNIQUE INDEX [IX_Roles_ExternalId] ON [Roles] ([ExternalId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260730090049_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Roles_IsActive_SortOrder] ON [Roles] ([IsActive], [SortOrder]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260730090049_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Roles_Name] ON [Roles] ([Name]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260730090049_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_UserWorkflowActivities_ActivityId] ON [UserWorkflowActivities] ([ActivityId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260730090049_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_UserWorkflowActivities_UserWorkflowId_SortOrder] ON [UserWorkflowActivities] ([UserWorkflowId], [SortOrder]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260730090049_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_UserWorkflows_OwnerObjectId] ON [UserWorkflows] ([OwnerObjectId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260730090049_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_UserWorkflows_OwnerObjectId_IsFavorite] ON [UserWorkflows] ([OwnerObjectId], [IsFavorite]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260730090049_InitialCreate'
)
BEGIN
    CREATE UNIQUE INDEX [IX_UserWorkflows_OwnerObjectId_Name] ON [UserWorkflows] ([OwnerObjectId], [Name]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260730090049_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_UserWorkflows_RoleId] ON [UserWorkflows] ([RoleId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260730090049_InitialCreate'
)
BEGIN
    CREATE UNIQUE INDEX [IX_WorkflowBuckets_ExternalId] ON [WorkflowBuckets] ([ExternalId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260730090049_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_WorkflowBuckets_IsActive_SortOrder] ON [WorkflowBuckets] ([IsActive], [SortOrder]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260730090049_InitialCreate'
)
BEGIN
    CREATE UNIQUE INDEX [IX_WorkflowBuckets_Name] ON [WorkflowBuckets] ([Name]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260730090049_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_WorkflowShares_RecipientObjectId] ON [WorkflowShares] ([RecipientObjectId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260730090049_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_WorkflowShares_UserWorkflowId] ON [WorkflowShares] ([UserWorkflowId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260730090049_InitialCreate'
)
BEGIN
    EXEC(N'CREATE UNIQUE INDEX [IX_WorkflowShares_UserWorkflowId_RecipientObjectId] ON [WorkflowShares] ([UserWorkflowId], [RecipientObjectId]) WHERE [IsRevoked] = 0');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260730090049_InitialCreate'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260730090049_InitialCreate', N'9.0.18');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260810132816_AddHuddleDomainSchema'
)
BEGIN
    CREATE TABLE [HuddleAgents] (
        [Id] int NOT NULL IDENTITY,
        [ExternalId] nvarchar(100) NOT NULL,
        [Name] nvarchar(200) NOT NULL,
        [ShortDescription] nvarchar(1000) NULL,
        [WhatItIs] nvarchar(max) NULL,
        [WhatItHelpsYouDo] nvarchar(max) NULL,
        [WhenToUseIt] nvarchar(max) NULL,
        [KeyBenefits] nvarchar(max) NULL,
        [AccessUrl] nvarchar(2000) NULL,
        [AccessLinkLabel] nvarchar(200) NULL,
        [CreatedAtUtc] datetimeoffset NOT NULL,
        [UpdatedAtUtc] datetimeoffset NULL,
        CONSTRAINT [PK_HuddleAgents] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260810132816_AddHuddleDomainSchema'
)
BEGIN
    CREATE TABLE [HuddleFocusAreas] (
        [Id] int NOT NULL IDENTITY,
        [ExternalId] nvarchar(100) NOT NULL,
        [Name] nvarchar(200) NOT NULL,
        [CreatedAtUtc] datetimeoffset NOT NULL,
        [UpdatedAtUtc] datetimeoffset NULL,
        CONSTRAINT [PK_HuddleFocusAreas] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260810132816_AddHuddleDomainSchema'
)
BEGIN
    CREATE TABLE [HuddleMcemStages] (
        [Id] int NOT NULL IDENTITY,
        [ExternalId] nvarchar(100) NOT NULL,
        [Name] nvarchar(200) NOT NULL,
        [Description] nvarchar(2000) NULL,
        [CreatedAtUtc] datetimeoffset NOT NULL,
        [UpdatedAtUtc] datetimeoffset NULL,
        CONSTRAINT [PK_HuddleMcemStages] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260810132816_AddHuddleDomainSchema'
)
BEGIN
    CREATE TABLE [HuddleResources] (
        [Id] int NOT NULL IDENTITY,
        [ExternalId] nvarchar(100) NOT NULL,
        [Title] nvarchar(300) NOT NULL,
        [Description] nvarchar(max) NULL,
        [Url] nvarchar(2000) NULL,
        [Type] nvarchar(100) NULL,
        [LinkLabel] nvarchar(200) NULL,
        [CreatedAtUtc] datetimeoffset NOT NULL,
        [UpdatedAtUtc] datetimeoffset NULL,
        CONSTRAINT [PK_HuddleResources] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260810132816_AddHuddleDomainSchema'
)
BEGIN
    CREATE TABLE [HuddleSegments] (
        [Id] int NOT NULL IDENTITY,
        [ExternalId] nvarchar(100) NOT NULL,
        [Name] nvarchar(200) NOT NULL,
        [CreatedAtUtc] datetimeoffset NOT NULL,
        [UpdatedAtUtc] datetimeoffset NULL,
        CONSTRAINT [PK_HuddleSegments] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260810132816_AddHuddleDomainSchema'
)
BEGIN
    CREATE TABLE [HuddleTopics] (
        [Id] int NOT NULL IDENTITY,
        [ExternalId] nvarchar(100) NOT NULL,
        [Name] nvarchar(300) NOT NULL,
        [Description] nvarchar(max) NULL,
        [Type] nvarchar(50) NOT NULL,
        [PublicationStatus] nvarchar(50) NOT NULL,
        [HuddleFocusAreaId] int NULL,
        [DurationMinutes] int NULL,
        [RecommendationPriority] int NULL,
        [AudienceDescription] nvarchar(max) NULL,
        [TodayObjective] nvarchar(max) NULL,
        [UseCase] nvarchar(max) NULL,
        [WhyItMatters] nvarchar(max) NULL,
        [DesiredOutcome] nvarchar(max) NULL,
        [StepsToGetStarted] nvarchar(max) NULL,
        [ReflectionPrompt] nvarchar(max) NULL,
        [CommitmentPrompt] nvarchar(max) NULL,
        [KeyTakeaway] nvarchar(max) NULL,
        [CreatedAtUtc] datetimeoffset NOT NULL,
        [UpdatedAtUtc] datetimeoffset NULL,
        CONSTRAINT [PK_HuddleTopics] PRIMARY KEY ([Id]),
        CONSTRAINT [CK_HuddleTopics_DurationMinutes] CHECK ([DurationMinutes] IS NULL OR [DurationMinutes] > 0),
        CONSTRAINT [FK_HuddleTopics_HuddleFocusAreas_HuddleFocusAreaId] FOREIGN KEY ([HuddleFocusAreaId]) REFERENCES [HuddleFocusAreas] ([Id]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260810132816_AddHuddleDomainSchema'
)
BEGIN
    CREATE TABLE [HuddleAgentResources] (
        [HuddleAgentId] int NOT NULL,
        [HuddleResourceId] int NOT NULL,
        [DisplayOrder] int NOT NULL,
        CONSTRAINT [PK_HuddleAgentResources] PRIMARY KEY ([HuddleAgentId], [HuddleResourceId]),
        CONSTRAINT [FK_HuddleAgentResources_HuddleAgents_HuddleAgentId] FOREIGN KEY ([HuddleAgentId]) REFERENCES [HuddleAgents] ([Id]) ON DELETE NO ACTION,
        CONSTRAINT [FK_HuddleAgentResources_HuddleResources_HuddleResourceId] FOREIGN KEY ([HuddleResourceId]) REFERENCES [HuddleResources] ([Id]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260810132816_AddHuddleDomainSchema'
)
BEGIN
    CREATE TABLE [HuddleSegmentRoles] (
        [Id] int NOT NULL IDENTITY,
        [ExternalId] nvarchar(100) NOT NULL,
        [HuddleSegmentId] int NOT NULL,
        [RoleId] int NOT NULL,
        [DisplayName] nvarchar(200) NOT NULL,
        [CreatedAtUtc] datetimeoffset NOT NULL,
        [UpdatedAtUtc] datetimeoffset NULL,
        CONSTRAINT [PK_HuddleSegmentRoles] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_HuddleSegmentRoles_HuddleSegments_HuddleSegmentId] FOREIGN KEY ([HuddleSegmentId]) REFERENCES [HuddleSegments] ([Id]) ON DELETE NO ACTION,
        CONSTRAINT [FK_HuddleSegmentRoles_Roles_RoleId] FOREIGN KEY ([RoleId]) REFERENCES [Roles] ([Id]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260810132816_AddHuddleDomainSchema'
)
BEGIN
    CREATE TABLE [HuddleFacilitatorGuides] (
        [Id] int NOT NULL IDENTITY,
        [ExternalId] nvarchar(100) NOT NULL,
        [HuddleTopicId] int NOT NULL,
        [SessionIntroduction] nvarchar(max) NULL,
        [KeyTalkingPoints] nvarchar(max) NULL,
        [DiscussionQuestions] nvarchar(max) NULL,
        [SuggestedTransitions] nvarchar(max) NULL,
        [WrapUpGuidance] nvarchar(max) NULL,
        [CreatedAtUtc] datetimeoffset NOT NULL,
        [UpdatedAtUtc] datetimeoffset NULL,
        CONSTRAINT [PK_HuddleFacilitatorGuides] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_HuddleFacilitatorGuides_HuddleTopics_HuddleTopicId] FOREIGN KEY ([HuddleTopicId]) REFERENCES [HuddleTopics] ([Id]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260810132816_AddHuddleDomainSchema'
)
BEGIN
    CREATE TABLE [HuddlePhases] (
        [Id] int NOT NULL IDENTITY,
        [ExternalId] nvarchar(100) NOT NULL,
        [HuddleTopicId] int NOT NULL,
        [DisplayOrder] int NOT NULL,
        [Name] nvarchar(300) NOT NULL,
        [Description] nvarchar(max) NULL,
        [DurationMinutes] int NULL,
        [CreatedAtUtc] datetimeoffset NOT NULL,
        [UpdatedAtUtc] datetimeoffset NULL,
        CONSTRAINT [PK_HuddlePhases] PRIMARY KEY ([Id]),
        CONSTRAINT [CK_HuddlePhases_DurationMinutes] CHECK ([DurationMinutes] IS NULL OR [DurationMinutes] > 0),
        CONSTRAINT [FK_HuddlePhases_HuddleTopics_HuddleTopicId] FOREIGN KEY ([HuddleTopicId]) REFERENCES [HuddleTopics] ([Id]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260810132816_AddHuddleDomainSchema'
)
BEGIN
    CREATE TABLE [HuddleTopicAgents] (
        [HuddleTopicId] int NOT NULL,
        [HuddleAgentId] int NOT NULL,
        [UsageType] nvarchar(20) NOT NULL,
        [DisplayLabel] nvarchar(max) NULL,
        [ShowAgentAccessLink] bit NOT NULL,
        [DisplayOrder] int NOT NULL,
        CONSTRAINT [PK_HuddleTopicAgents] PRIMARY KEY ([HuddleTopicId], [HuddleAgentId], [UsageType]),
        CONSTRAINT [FK_HuddleTopicAgents_HuddleAgents_HuddleAgentId] FOREIGN KEY ([HuddleAgentId]) REFERENCES [HuddleAgents] ([Id]) ON DELETE NO ACTION,
        CONSTRAINT [FK_HuddleTopicAgents_HuddleTopics_HuddleTopicId] FOREIGN KEY ([HuddleTopicId]) REFERENCES [HuddleTopics] ([Id]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260810132816_AddHuddleDomainSchema'
)
BEGIN
    CREATE TABLE [HuddleTopicMcemStages] (
        [HuddleTopicId] int NOT NULL,
        [HuddleMcemStageId] int NOT NULL,
        [DisplayOrder] int NOT NULL,
        CONSTRAINT [PK_HuddleTopicMcemStages] PRIMARY KEY ([HuddleTopicId], [HuddleMcemStageId]),
        CONSTRAINT [FK_HuddleTopicMcemStages_HuddleMcemStages_HuddleMcemStageId] FOREIGN KEY ([HuddleMcemStageId]) REFERENCES [HuddleMcemStages] ([Id]) ON DELETE NO ACTION,
        CONSTRAINT [FK_HuddleTopicMcemStages_HuddleTopics_HuddleTopicId] FOREIGN KEY ([HuddleTopicId]) REFERENCES [HuddleTopics] ([Id]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260810132816_AddHuddleDomainSchema'
)
BEGIN
    CREATE TABLE [HuddleTopicResources] (
        [HuddleTopicId] int NOT NULL,
        [HuddleResourceId] int NOT NULL,
        [DisplayOrder] int NOT NULL,
        CONSTRAINT [PK_HuddleTopicResources] PRIMARY KEY ([HuddleTopicId], [HuddleResourceId]),
        CONSTRAINT [FK_HuddleTopicResources_HuddleResources_HuddleResourceId] FOREIGN KEY ([HuddleResourceId]) REFERENCES [HuddleResources] ([Id]) ON DELETE NO ACTION,
        CONSTRAINT [FK_HuddleTopicResources_HuddleTopics_HuddleTopicId] FOREIGN KEY ([HuddleTopicId]) REFERENCES [HuddleTopics] ([Id]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260810132816_AddHuddleDomainSchema'
)
BEGIN
    CREATE TABLE [HuddleTopicRoles] (
        [HuddleTopicId] int NOT NULL,
        [RoleId] int NOT NULL,
        CONSTRAINT [PK_HuddleTopicRoles] PRIMARY KEY ([HuddleTopicId], [RoleId]),
        CONSTRAINT [FK_HuddleTopicRoles_HuddleTopics_HuddleTopicId] FOREIGN KEY ([HuddleTopicId]) REFERENCES [HuddleTopics] ([Id]) ON DELETE NO ACTION,
        CONSTRAINT [FK_HuddleTopicRoles_Roles_RoleId] FOREIGN KEY ([RoleId]) REFERENCES [Roles] ([Id]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260810132816_AddHuddleDomainSchema'
)
BEGIN
    CREATE TABLE [HuddleVotes] (
        [Id] uniqueidentifier NOT NULL,
        [OwnerObjectId] nvarchar(100) NOT NULL,
        [HuddleTopicId] int NOT NULL,
        [Value] int NOT NULL,
        [DownvoteReasons] nvarchar(max) NULL,
        [Comment] nvarchar(2000) NULL,
        [CreatedAtUtc] datetimeoffset NOT NULL,
        [UpdatedAtUtc] datetimeoffset NULL,
        CONSTRAINT [PK_HuddleVotes] PRIMARY KEY ([Id]),
        CONSTRAINT [CK_HuddleVotes_Value] CHECK ([Value] IN (-1, 1)),
        CONSTRAINT [FK_HuddleVotes_HuddleTopics_HuddleTopicId] FOREIGN KEY ([HuddleTopicId]) REFERENCES [HuddleTopics] ([Id]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260810132816_AddHuddleDomainSchema'
)
BEGIN
    CREATE TABLE [HuddleRolePathItems] (
        [HuddleSegmentRoleId] int NOT NULL,
        [WeekPosition] int NOT NULL,
        [HuddleTopicId] int NOT NULL,
        CONSTRAINT [PK_HuddleRolePathItems] PRIMARY KEY ([HuddleSegmentRoleId], [WeekPosition]),
        CONSTRAINT [CK_HuddleRolePathItems_WeekPosition] CHECK ([WeekPosition] > 0),
        CONSTRAINT [FK_HuddleRolePathItems_HuddleSegmentRoles_HuddleSegmentRoleId] FOREIGN KEY ([HuddleSegmentRoleId]) REFERENCES [HuddleSegmentRoles] ([Id]) ON DELETE NO ACTION,
        CONSTRAINT [FK_HuddleRolePathItems_HuddleTopics_HuddleTopicId] FOREIGN KEY ([HuddleTopicId]) REFERENCES [HuddleTopics] ([Id]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260810132816_AddHuddleDomainSchema'
)
BEGIN
    CREATE TABLE [UserHuddlePlans] (
        [Id] uniqueidentifier NOT NULL,
        [OwnerObjectId] nvarchar(100) NOT NULL,
        [HuddleSegmentRoleId] int NOT NULL,
        [Name] nvarchar(200) NOT NULL,
        [RowVersion] rowversion NOT NULL,
        [CreatedAtUtc] datetimeoffset NOT NULL,
        [UpdatedAtUtc] datetimeoffset NULL,
        CONSTRAINT [PK_UserHuddlePlans] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_UserHuddlePlans_HuddleSegmentRoles_HuddleSegmentRoleId] FOREIGN KEY ([HuddleSegmentRoleId]) REFERENCES [HuddleSegmentRoles] ([Id]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260810132816_AddHuddleDomainSchema'
)
BEGIN
    CREATE TABLE [HuddleActivities] (
        [Id] int NOT NULL IDENTITY,
        [ExternalId] nvarchar(100) NOT NULL,
        [HuddleTopicId] int NOT NULL,
        [HuddlePhaseId] int NOT NULL,
        [DisplayOrder] int NOT NULL,
        [Name] nvarchar(300) NOT NULL,
        [Description] nvarchar(max) NULL,
        [DurationMinutes] int NULL,
        [Prompt] nvarchar(max) NULL,
        [ExpectedOutput] nvarchar(max) NULL,
        [HumanCheckpoint] nvarchar(max) NULL,
        [RequiredContext] nvarchar(max) NULL,
        [BestFitJob] nvarchar(max) NULL,
        [CreatedAtUtc] datetimeoffset NOT NULL,
        [UpdatedAtUtc] datetimeoffset NULL,
        CONSTRAINT [PK_HuddleActivities] PRIMARY KEY ([Id]),
        CONSTRAINT [CK_HuddleActivities_DurationMinutes] CHECK ([DurationMinutes] IS NULL OR [DurationMinutes] > 0),
        CONSTRAINT [FK_HuddleActivities_HuddlePhases_HuddlePhaseId] FOREIGN KEY ([HuddlePhaseId]) REFERENCES [HuddlePhases] ([Id]) ON DELETE NO ACTION,
        CONSTRAINT [FK_HuddleActivities_HuddleTopics_HuddleTopicId] FOREIGN KEY ([HuddleTopicId]) REFERENCES [HuddleTopics] ([Id]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260810132816_AddHuddleDomainSchema'
)
BEGIN
    CREATE TABLE [UserHuddleSessions] (
        [Id] uniqueidentifier NOT NULL,
        [OwnerObjectId] nvarchar(100) NOT NULL,
        [HuddleTopicId] int NOT NULL,
        [CurrentHuddlePhaseId] int NULL,
        [Notes] nvarchar(max) NULL,
        [CompletedAtUtc] datetimeoffset NULL,
        [RowVersion] rowversion NOT NULL,
        [CreatedAtUtc] datetimeoffset NOT NULL,
        [UpdatedAtUtc] datetimeoffset NULL,
        CONSTRAINT [PK_UserHuddleSessions] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_UserHuddleSessions_HuddlePhases_CurrentHuddlePhaseId] FOREIGN KEY ([CurrentHuddlePhaseId]) REFERENCES [HuddlePhases] ([Id]) ON DELETE NO ACTION,
        CONSTRAINT [FK_UserHuddleSessions_HuddleTopics_HuddleTopicId] FOREIGN KEY ([HuddleTopicId]) REFERENCES [HuddleTopics] ([Id]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260810132816_AddHuddleDomainSchema'
)
BEGIN
    CREATE TABLE [UserHuddlePlanItems] (
        [UserHuddlePlanId] uniqueidentifier NOT NULL,
        [WeekPosition] int NOT NULL,
        [HuddleTopicId] int NOT NULL,
        CONSTRAINT [PK_UserHuddlePlanItems] PRIMARY KEY ([UserHuddlePlanId], [WeekPosition]),
        CONSTRAINT [CK_UserHuddlePlanItems_WeekPosition] CHECK ([WeekPosition] > 0),
        CONSTRAINT [FK_UserHuddlePlanItems_HuddleTopics_HuddleTopicId] FOREIGN KEY ([HuddleTopicId]) REFERENCES [HuddleTopics] ([Id]) ON DELETE NO ACTION,
        CONSTRAINT [FK_UserHuddlePlanItems_UserHuddlePlans_UserHuddlePlanId] FOREIGN KEY ([UserHuddlePlanId]) REFERENCES [UserHuddlePlans] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260810132816_AddHuddleDomainSchema'
)
BEGIN
    CREATE TABLE [HuddleActivityAgents] (
        [HuddleActivityId] int NOT NULL,
        [HuddleAgentId] int NOT NULL,
        [UsageType] nvarchar(20) NOT NULL,
        [DisplayLabel] nvarchar(max) NULL,
        [ShowAgentAccessLink] bit NOT NULL,
        [DisplayOrder] int NOT NULL,
        CONSTRAINT [PK_HuddleActivityAgents] PRIMARY KEY ([HuddleActivityId], [HuddleAgentId], [UsageType]),
        CONSTRAINT [FK_HuddleActivityAgents_HuddleActivities_HuddleActivityId] FOREIGN KEY ([HuddleActivityId]) REFERENCES [HuddleActivities] ([Id]) ON DELETE NO ACTION,
        CONSTRAINT [FK_HuddleActivityAgents_HuddleAgents_HuddleAgentId] FOREIGN KEY ([HuddleAgentId]) REFERENCES [HuddleAgents] ([Id]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260810132816_AddHuddleDomainSchema'
)
BEGIN
    CREATE TABLE [HuddleActivityResources] (
        [HuddleActivityId] int NOT NULL,
        [HuddleResourceId] int NOT NULL,
        [DisplayOrder] int NOT NULL,
        CONSTRAINT [PK_HuddleActivityResources] PRIMARY KEY ([HuddleActivityId], [HuddleResourceId]),
        CONSTRAINT [FK_HuddleActivityResources_HuddleActivities_HuddleActivityId] FOREIGN KEY ([HuddleActivityId]) REFERENCES [HuddleActivities] ([Id]) ON DELETE NO ACTION,
        CONSTRAINT [FK_HuddleActivityResources_HuddleResources_HuddleResourceId] FOREIGN KEY ([HuddleResourceId]) REFERENCES [HuddleResources] ([Id]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260810132816_AddHuddleDomainSchema'
)
BEGIN
    CREATE TABLE [UserHuddleActivityProgress] (
        [UserHuddleSessionId] uniqueidentifier NOT NULL,
        [HuddleActivityId] int NOT NULL,
        [IsCompleted] bit NOT NULL,
        [CompletedAtUtc] datetimeoffset NULL,
        CONSTRAINT [PK_UserHuddleActivityProgress] PRIMARY KEY ([UserHuddleSessionId], [HuddleActivityId]),
        CONSTRAINT [FK_UserHuddleActivityProgress_HuddleActivities_HuddleActivityId] FOREIGN KEY ([HuddleActivityId]) REFERENCES [HuddleActivities] ([Id]) ON DELETE NO ACTION,
        CONSTRAINT [FK_UserHuddleActivityProgress_UserHuddleSessions_UserHuddleSessionId] FOREIGN KEY ([UserHuddleSessionId]) REFERENCES [UserHuddleSessions] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260810132816_AddHuddleDomainSchema'
)
BEGIN
    CREATE UNIQUE INDEX [IX_HuddleActivities_ExternalId] ON [HuddleActivities] ([ExternalId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260810132816_AddHuddleDomainSchema'
)
BEGIN
    CREATE UNIQUE INDEX [IX_HuddleActivities_HuddlePhaseId_DisplayOrder] ON [HuddleActivities] ([HuddlePhaseId], [DisplayOrder]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260810132816_AddHuddleDomainSchema'
)
BEGIN
    CREATE INDEX [IX_HuddleActivities_HuddleTopicId] ON [HuddleActivities] ([HuddleTopicId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260810132816_AddHuddleDomainSchema'
)
BEGIN
    CREATE UNIQUE INDEX [IX_HuddleActivityAgents_HuddleActivityId_DisplayOrder] ON [HuddleActivityAgents] ([HuddleActivityId], [DisplayOrder]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260810132816_AddHuddleDomainSchema'
)
BEGIN
    CREATE INDEX [IX_HuddleActivityAgents_HuddleAgentId] ON [HuddleActivityAgents] ([HuddleAgentId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260810132816_AddHuddleDomainSchema'
)
BEGIN
    CREATE UNIQUE INDEX [IX_HuddleActivityResources_HuddleActivityId_DisplayOrder] ON [HuddleActivityResources] ([HuddleActivityId], [DisplayOrder]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260810132816_AddHuddleDomainSchema'
)
BEGIN
    CREATE INDEX [IX_HuddleActivityResources_HuddleResourceId] ON [HuddleActivityResources] ([HuddleResourceId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260810132816_AddHuddleDomainSchema'
)
BEGIN
    CREATE UNIQUE INDEX [IX_HuddleAgentResources_HuddleAgentId_DisplayOrder] ON [HuddleAgentResources] ([HuddleAgentId], [DisplayOrder]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260810132816_AddHuddleDomainSchema'
)
BEGIN
    CREATE INDEX [IX_HuddleAgentResources_HuddleResourceId] ON [HuddleAgentResources] ([HuddleResourceId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260810132816_AddHuddleDomainSchema'
)
BEGIN
    CREATE UNIQUE INDEX [IX_HuddleAgents_ExternalId] ON [HuddleAgents] ([ExternalId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260810132816_AddHuddleDomainSchema'
)
BEGIN
    CREATE UNIQUE INDEX [IX_HuddleFacilitatorGuides_ExternalId] ON [HuddleFacilitatorGuides] ([ExternalId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260810132816_AddHuddleDomainSchema'
)
BEGIN
    CREATE UNIQUE INDEX [IX_HuddleFacilitatorGuides_HuddleTopicId] ON [HuddleFacilitatorGuides] ([HuddleTopicId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260810132816_AddHuddleDomainSchema'
)
BEGIN
    CREATE UNIQUE INDEX [IX_HuddleFocusAreas_ExternalId] ON [HuddleFocusAreas] ([ExternalId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260810132816_AddHuddleDomainSchema'
)
BEGIN
    CREATE UNIQUE INDEX [IX_HuddleMcemStages_ExternalId] ON [HuddleMcemStages] ([ExternalId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260810132816_AddHuddleDomainSchema'
)
BEGIN
    CREATE UNIQUE INDEX [IX_HuddlePhases_ExternalId] ON [HuddlePhases] ([ExternalId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260810132816_AddHuddleDomainSchema'
)
BEGIN
    CREATE UNIQUE INDEX [IX_HuddlePhases_HuddleTopicId_DisplayOrder] ON [HuddlePhases] ([HuddleTopicId], [DisplayOrder]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260810132816_AddHuddleDomainSchema'
)
BEGIN
    CREATE UNIQUE INDEX [IX_HuddleResources_ExternalId] ON [HuddleResources] ([ExternalId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260810132816_AddHuddleDomainSchema'
)
BEGIN
    CREATE INDEX [IX_HuddleRolePathItems_HuddleTopicId] ON [HuddleRolePathItems] ([HuddleTopicId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260810132816_AddHuddleDomainSchema'
)
BEGIN
    CREATE UNIQUE INDEX [IX_HuddleSegmentRoles_ExternalId] ON [HuddleSegmentRoles] ([ExternalId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260810132816_AddHuddleDomainSchema'
)
BEGIN
    CREATE UNIQUE INDEX [IX_HuddleSegmentRoles_HuddleSegmentId_RoleId] ON [HuddleSegmentRoles] ([HuddleSegmentId], [RoleId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260810132816_AddHuddleDomainSchema'
)
BEGIN
    CREATE INDEX [IX_HuddleSegmentRoles_RoleId] ON [HuddleSegmentRoles] ([RoleId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260810132816_AddHuddleDomainSchema'
)
BEGIN
    CREATE UNIQUE INDEX [IX_HuddleSegments_ExternalId] ON [HuddleSegments] ([ExternalId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260810132816_AddHuddleDomainSchema'
)
BEGIN
    CREATE INDEX [IX_HuddleTopicAgents_HuddleAgentId] ON [HuddleTopicAgents] ([HuddleAgentId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260810132816_AddHuddleDomainSchema'
)
BEGIN
    CREATE UNIQUE INDEX [IX_HuddleTopicAgents_HuddleTopicId_DisplayOrder] ON [HuddleTopicAgents] ([HuddleTopicId], [DisplayOrder]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260810132816_AddHuddleDomainSchema'
)
BEGIN
    CREATE INDEX [IX_HuddleTopicMcemStages_HuddleMcemStageId] ON [HuddleTopicMcemStages] ([HuddleMcemStageId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260810132816_AddHuddleDomainSchema'
)
BEGIN
    CREATE UNIQUE INDEX [IX_HuddleTopicMcemStages_HuddleTopicId_DisplayOrder] ON [HuddleTopicMcemStages] ([HuddleTopicId], [DisplayOrder]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260810132816_AddHuddleDomainSchema'
)
BEGIN
    CREATE INDEX [IX_HuddleTopicResources_HuddleResourceId] ON [HuddleTopicResources] ([HuddleResourceId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260810132816_AddHuddleDomainSchema'
)
BEGIN
    CREATE UNIQUE INDEX [IX_HuddleTopicResources_HuddleTopicId_DisplayOrder] ON [HuddleTopicResources] ([HuddleTopicId], [DisplayOrder]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260810132816_AddHuddleDomainSchema'
)
BEGIN
    CREATE INDEX [IX_HuddleTopicRoles_RoleId] ON [HuddleTopicRoles] ([RoleId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260810132816_AddHuddleDomainSchema'
)
BEGIN
    CREATE UNIQUE INDEX [IX_HuddleTopics_ExternalId] ON [HuddleTopics] ([ExternalId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260810132816_AddHuddleDomainSchema'
)
BEGIN
    CREATE INDEX [IX_HuddleTopics_HuddleFocusAreaId] ON [HuddleTopics] ([HuddleFocusAreaId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260810132816_AddHuddleDomainSchema'
)
BEGIN
    CREATE INDEX [IX_HuddleVotes_HuddleTopicId] ON [HuddleVotes] ([HuddleTopicId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260810132816_AddHuddleDomainSchema'
)
BEGIN
    CREATE UNIQUE INDEX [IX_HuddleVotes_OwnerObjectId_HuddleTopicId] ON [HuddleVotes] ([OwnerObjectId], [HuddleTopicId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260810132816_AddHuddleDomainSchema'
)
BEGIN
    CREATE INDEX [IX_UserHuddleActivityProgress_HuddleActivityId] ON [UserHuddleActivityProgress] ([HuddleActivityId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260810132816_AddHuddleDomainSchema'
)
BEGIN
    CREATE INDEX [IX_UserHuddlePlanItems_HuddleTopicId] ON [UserHuddlePlanItems] ([HuddleTopicId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260810132816_AddHuddleDomainSchema'
)
BEGIN
    CREATE INDEX [IX_UserHuddlePlans_HuddleSegmentRoleId] ON [UserHuddlePlans] ([HuddleSegmentRoleId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260810132816_AddHuddleDomainSchema'
)
BEGIN
    CREATE INDEX [IX_UserHuddleSessions_CurrentHuddlePhaseId] ON [UserHuddleSessions] ([CurrentHuddlePhaseId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260810132816_AddHuddleDomainSchema'
)
BEGIN
    CREATE INDEX [IX_UserHuddleSessions_HuddleTopicId] ON [UserHuddleSessions] ([HuddleTopicId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260810132816_AddHuddleDomainSchema'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260810132816_AddHuddleDomainSchema', N'9.0.18');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260811114410_InitialCreate2'
)
BEGIN
    CREATE UNIQUE INDEX [IX_UserHuddlePlans_OwnerObjectId_HuddleSegmentRoleId] ON [UserHuddlePlans] ([OwnerObjectId], [HuddleSegmentRoleId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260811114410_InitialCreate2'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260811114410_InitialCreate2', N'9.0.18');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260811153228_AddPersistentHuddleSessionProgress'
)
BEGIN
    DECLARE @var sysname;
    SELECT @var = [d].[name]
    FROM [sys].[default_constraints] [d]
    INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
    WHERE ([d].[parent_object_id] = OBJECT_ID(N'[UserHuddleSessions]') AND [c].[name] = N'Notes');
    IF @var IS NOT NULL EXEC(N'ALTER TABLE [UserHuddleSessions] DROP CONSTRAINT [' + @var + '];');
    ALTER TABLE [UserHuddleSessions] ALTER COLUMN [Notes] nvarchar(4000) NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260811153228_AddPersistentHuddleSessionProgress'
)
BEGIN
    ALTER TABLE [UserHuddleSessions] ADD [LastSavedAtUtc] datetimeoffset NOT NULL DEFAULT '0001-01-01T00:00:00.0000000+00:00';
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260811153228_AddPersistentHuddleSessionProgress'
)
BEGIN
    ALTER TABLE [UserHuddleSessions] ADD [SessionStatus] nvarchar(20) NOT NULL DEFAULT N'';
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260811153228_AddPersistentHuddleSessionProgress'
)
BEGIN
    ALTER TABLE [UserHuddleSessions] ADD [StartedAtUtc] datetimeoffset NOT NULL DEFAULT '0001-01-01T00:00:00.0000000+00:00';
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260811153228_AddPersistentHuddleSessionProgress'
)
BEGIN
    CREATE UNIQUE INDEX [IX_UserHuddleSessions_OwnerObjectId_HuddleTopicId] ON [UserHuddleSessions] ([OwnerObjectId], [HuddleTopicId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260811153228_AddPersistentHuddleSessionProgress'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260811153228_AddPersistentHuddleSessionProgress', N'9.0.18');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260814072409_AddUserHuddleLaunchPlans'
)
BEGIN
    CREATE TABLE [UserHuddleLaunchPlans] (
        [Id] uniqueidentifier NOT NULL,
        [OwnerObjectId] nvarchar(100) NOT NULL,
        [TeamName] nvarchar(200) NOT NULL,
        [CohortName] nvarchar(200) NOT NULL,
        [StartDate] date NOT NULL,
        [EndDate] date NULL,
        [SponsorName] nvarchar(200) NOT NULL,
        [Managers] nvarchar(2000) NOT NULL,
        [Facilitators] nvarchar(2000) NOT NULL,
        [ProgramLead] nvarchar(200) NOT NULL,
        [TaskStateJson] nvarchar(max) NOT NULL,
        [RowVersion] rowversion NOT NULL,
        [CreatedAtUtc] datetimeoffset NOT NULL,
        [UpdatedAtUtc] datetimeoffset NULL,
        CONSTRAINT [PK_UserHuddleLaunchPlans] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260814072409_AddUserHuddleLaunchPlans'
)
BEGIN
    CREATE UNIQUE INDEX [IX_UserHuddleLaunchPlans_OwnerObjectId] ON [UserHuddleLaunchPlans] ([OwnerObjectId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260814072409_AddUserHuddleLaunchPlans'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260814072409_AddUserHuddleLaunchPlans', N'9.0.18');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260820131629_NewMigration'
)
BEGIN
    DROP INDEX [IX_HuddlePhases_HuddleTopicId_DisplayOrder] ON [HuddlePhases];
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260820131629_NewMigration'
)
BEGIN
    DROP INDEX [IX_HuddleFacilitatorGuides_HuddleTopicId] ON [HuddleFacilitatorGuides];
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260820131629_NewMigration'
)
BEGIN
    DROP INDEX [IX_HuddleActivities_HuddlePhaseId_DisplayOrder] ON [HuddleActivities];
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260820131629_NewMigration'
)
BEGIN
    ALTER TABLE [HuddleResources] ADD [IsGlobal] bit NOT NULL DEFAULT CAST(0 AS bit);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260820131629_NewMigration'
)
BEGIN
    ALTER TABLE [HuddlePhases] ADD [HuddlePlacementId] int NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260820131629_NewMigration'
)
BEGIN
    ALTER TABLE [HuddleMcemStages] ADD [StageNumber] int NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260820131629_NewMigration'
)
BEGIN
    ALTER TABLE [HuddleFacilitatorGuides] ADD [BringBackEvidence] nvarchar(max) NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260820131629_NewMigration'
)
BEGIN
    ALTER TABLE [HuddleFacilitatorGuides] ADD [CommitPrompt] nvarchar(max) NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260820131629_NewMigration'
)
BEGIN
    ALTER TABLE [HuddleFacilitatorGuides] ADD [FacilitatorQuestions] nvarchar(max) NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260820131629_NewMigration'
)
BEGIN
    ALTER TABLE [HuddleFacilitatorGuides] ADD [FallbackGuidance] nvarchar(max) NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260820131629_NewMigration'
)
BEGIN
    ALTER TABLE [HuddleFacilitatorGuides] ADD [HuddlePlacementId] int NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260820131629_NewMigration'
)
BEGIN
    ALTER TABLE [HuddleFacilitatorGuides] ADD [ListenFor] nvarchar(max) NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260820131629_NewMigration'
)
BEGIN
    ALTER TABLE [HuddleFacilitatorGuides] ADD [PreparationChecklist] nvarchar(max) NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260820131629_NewMigration'
)
BEGIN
    ALTER TABLE [HuddleFacilitatorGuides] ADD [ReflectPrompt] nvarchar(max) NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260820131629_NewMigration'
)
BEGIN
    ALTER TABLE [HuddleAgents] ADD [StepsToGetStarted] nvarchar(max) NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260820131629_NewMigration'
)
BEGIN
    ALTER TABLE [HuddleAgents] ADD [WhenNotToUseIt] nvarchar(max) NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260820131629_NewMigration'
)
BEGIN
    ALTER TABLE [HuddleActivities] ADD [ActivitySteps] nvarchar(max) NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260820131629_NewMigration'
)
BEGIN
    ALTER TABLE [HuddleActivities] ADD [ExecutionMethod] nvarchar(20) NOT NULL DEFAULT N'';
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260820131629_NewMigration'
)
BEGIN
    ALTER TABLE [HuddleActivities] ADD [HuddlePlacementId] int NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260820131629_NewMigration'
)
BEGIN
    ALTER TABLE [HuddleActivities] ADD [LaunchLabel] nvarchar(200) NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260820131629_NewMigration'
)
BEGIN
    ALTER TABLE [HuddleActivities] ADD [LaunchUrl] nvarchar(2000) NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260820131629_NewMigration'
)
BEGIN
    ALTER TABLE [HuddleActivities] ADD [PracticeTier] nvarchar(20) NOT NULL DEFAULT N'';
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260820131629_NewMigration'
)
BEGIN
    ALTER TABLE [HuddleActivities] ADD [PrerequisiteHuddleActivityId] int NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260820131629_NewMigration'
)
BEGIN
    ALTER TABLE [HuddleActivities] ADD [WhyThisMatters] nvarchar(max) NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260820131629_NewMigration'
)
BEGIN
    CREATE TABLE [HuddlePlacements] (
        [Id] int NOT NULL IDENTITY,
        [ExternalId] nvarchar(100) NOT NULL,
        [HuddleSegmentRoleId] int NOT NULL,
        [HuddleTopicId] int NOT NULL,
        [PathSection] nvarchar(50) NOT NULL,
        [Sequence] int NOT NULL,
        [RoleTopicName] nvarchar(300) NOT NULL,
        [RoleTopicDescription] nvarchar(max) NULL,
        [TodayObjective] nvarchar(max) NULL,
        [Wiifm] nvarchar(max) NULL,
        [DesiredOutcome] nvarchar(max) NULL,
        [IsActive] bit NOT NULL,
        [CreatedAtUtc] datetimeoffset NOT NULL,
        [UpdatedAtUtc] datetimeoffset NULL,
        CONSTRAINT [PK_HuddlePlacements] PRIMARY KEY ([Id]),
        CONSTRAINT [CK_HuddlePlacements_Sequence] CHECK ([Sequence] > 0),
        CONSTRAINT [FK_HuddlePlacements_HuddleSegmentRoles_HuddleSegmentRoleId] FOREIGN KEY ([HuddleSegmentRoleId]) REFERENCES [HuddleSegmentRoles] ([Id]) ON DELETE NO ACTION,
        CONSTRAINT [FK_HuddlePlacements_HuddleTopics_HuddleTopicId] FOREIGN KEY ([HuddleTopicId]) REFERENCES [HuddleTopics] ([Id]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260820131629_NewMigration'
)
BEGIN
    EXEC(N'CREATE UNIQUE INDEX [IX_HuddlePhases_HuddlePlacementId_DisplayOrder] ON [HuddlePhases] ([HuddlePlacementId], [DisplayOrder]) WHERE [HuddlePlacementId] IS NOT NULL');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260820131629_NewMigration'
)
BEGIN
    EXEC(N'CREATE UNIQUE INDEX [IX_HuddlePhases_HuddleTopicId_DisplayOrder] ON [HuddlePhases] ([HuddleTopicId], [DisplayOrder]) WHERE [HuddlePlacementId] IS NULL');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260820131629_NewMigration'
)
BEGIN
    EXEC(N'ALTER TABLE [HuddleMcemStages] ADD CONSTRAINT [CK_HuddleMcemStages_StageNumber] CHECK ([StageNumber] IS NULL OR [StageNumber] BETWEEN 1 AND 5)');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260820131629_NewMigration'
)
BEGIN
    EXEC(N'CREATE UNIQUE INDEX [IX_HuddleFacilitatorGuides_HuddlePlacementId] ON [HuddleFacilitatorGuides] ([HuddlePlacementId]) WHERE [HuddlePlacementId] IS NOT NULL');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260820131629_NewMigration'
)
BEGIN
    EXEC(N'CREATE UNIQUE INDEX [IX_HuddleFacilitatorGuides_HuddleTopicId] ON [HuddleFacilitatorGuides] ([HuddleTopicId]) WHERE [HuddlePlacementId] IS NULL');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260820131629_NewMigration'
)
BEGIN
    EXEC(N'CREATE UNIQUE INDEX [IX_HuddleActivities_HuddlePhaseId_DisplayOrder] ON [HuddleActivities] ([HuddlePhaseId], [DisplayOrder]) WHERE [HuddlePlacementId] IS NULL');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260820131629_NewMigration'
)
BEGIN
    EXEC(N'CREATE UNIQUE INDEX [IX_HuddleActivities_HuddlePlacementId_HuddlePhaseId_DisplayOrder] ON [HuddleActivities] ([HuddlePlacementId], [HuddlePhaseId], [DisplayOrder]) WHERE [HuddlePlacementId] IS NOT NULL');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260820131629_NewMigration'
)
BEGIN
    CREATE INDEX [IX_HuddleActivities_HuddlePlacementId_PracticeTier] ON [HuddleActivities] ([HuddlePlacementId], [PracticeTier]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260820131629_NewMigration'
)
BEGIN
    CREATE INDEX [IX_HuddleActivities_PrerequisiteHuddleActivityId] ON [HuddleActivities] ([PrerequisiteHuddleActivityId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260820131629_NewMigration'
)
BEGIN
    CREATE UNIQUE INDEX [IX_HuddlePlacements_ExternalId] ON [HuddlePlacements] ([ExternalId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260820131629_NewMigration'
)
BEGIN
    CREATE UNIQUE INDEX [IX_HuddlePlacements_HuddleSegmentRoleId_PathSection_Sequence] ON [HuddlePlacements] ([HuddleSegmentRoleId], [PathSection], [Sequence]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260820131629_NewMigration'
)
BEGIN
    CREATE INDEX [IX_HuddlePlacements_HuddleTopicId] ON [HuddlePlacements] ([HuddleTopicId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260820131629_NewMigration'
)
BEGIN
    ALTER TABLE [HuddleActivities] ADD CONSTRAINT [FK_HuddleActivities_HuddleActivities_PrerequisiteHuddleActivityId] FOREIGN KEY ([PrerequisiteHuddleActivityId]) REFERENCES [HuddleActivities] ([Id]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260820131629_NewMigration'
)
BEGIN
    ALTER TABLE [HuddleActivities] ADD CONSTRAINT [FK_HuddleActivities_HuddlePlacements_HuddlePlacementId] FOREIGN KEY ([HuddlePlacementId]) REFERENCES [HuddlePlacements] ([Id]) ON DELETE NO ACTION;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260820131629_NewMigration'
)
BEGIN
    ALTER TABLE [HuddleFacilitatorGuides] ADD CONSTRAINT [FK_HuddleFacilitatorGuides_HuddlePlacements_HuddlePlacementId] FOREIGN KEY ([HuddlePlacementId]) REFERENCES [HuddlePlacements] ([Id]) ON DELETE NO ACTION;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260820131629_NewMigration'
)
BEGIN
    ALTER TABLE [HuddlePhases] ADD CONSTRAINT [FK_HuddlePhases_HuddlePlacements_HuddlePlacementId] FOREIGN KEY ([HuddlePlacementId]) REFERENCES [HuddlePlacements] ([Id]) ON DELETE NO ACTION;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260820131629_NewMigration'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260820131629_NewMigration', N'9.0.18');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260821114851_AddUserHuddlePlanItemPlacement'
)
BEGIN
    ALTER TABLE [UserHuddlePlanItems] ADD [HuddlePlacementId] int NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260821114851_AddUserHuddlePlanItemPlacement'
)
BEGIN
    CREATE INDEX [IX_UserHuddlePlanItems_HuddlePlacementId] ON [UserHuddlePlanItems] ([HuddlePlacementId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260821114851_AddUserHuddlePlanItemPlacement'
)
BEGIN
    ALTER TABLE [UserHuddlePlanItems] ADD CONSTRAINT [FK_UserHuddlePlanItems_HuddlePlacements_HuddlePlacementId] FOREIGN KEY ([HuddlePlacementId]) REFERENCES [HuddlePlacements] ([Id]) ON DELETE NO ACTION;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260821114851_AddUserHuddlePlanItemPlacement'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260821114851_AddUserHuddlePlanItemPlacement', N'9.0.18');
END;

COMMIT;
GO

