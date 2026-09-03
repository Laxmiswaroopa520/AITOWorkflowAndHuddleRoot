/*
    Preflight checks. Run first, after the EF Core migration and before any data script.
    Read-only. Fails fast if the migration has not been applied, so a data script cannot
    half-load against an old schema.
*/
SET NOCOUNT ON;

DECLARE @missing TABLE ([Object] NVARCHAR(200), [Detail] NVARCHAR(400));

IF OBJECT_ID('dbo.HuddlePlacements', 'U') IS NULL
    INSERT INTO @missing VALUES (N'dbo.HuddlePlacements', N'Table is absent. Apply the migration first.');

INSERT INTO @missing ([Object], [Detail])
SELECT N'dbo.' + x.[TableName] + N'.' + x.[ColumnName], N'Column is absent. Apply the migration first.'
FROM (VALUES
    (N'HuddleActivities', N'HuddlePlacementId'), (N'HuddleActivities', N'PracticeTier'),
    (N'HuddleActivities', N'ExecutionMethod'), (N'HuddleActivities', N'ActivitySteps'),
    (N'HuddleActivities', N'WhyThisMatters'), (N'HuddleActivities', N'LaunchUrl'),
    (N'HuddleActivities', N'LaunchLabel'), (N'HuddleActivities', N'PrerequisiteHuddleActivityId'),
    (N'HuddlePhases', N'HuddlePlacementId'),
    (N'HuddleFacilitatorGuides', N'HuddlePlacementId'), (N'HuddleFacilitatorGuides', N'PreparationChecklist'),
    (N'HuddleFacilitatorGuides', N'FacilitatorQuestions'), (N'HuddleFacilitatorGuides', N'ListenFor'),
    (N'HuddleFacilitatorGuides', N'FallbackGuidance'), (N'HuddleFacilitatorGuides', N'ReflectPrompt'),
    (N'HuddleFacilitatorGuides', N'CommitPrompt'), (N'HuddleFacilitatorGuides', N'BringBackEvidence'),
    (N'HuddleAgents', N'WhenNotToUseIt'), (N'HuddleAgents', N'StepsToGetStarted'),
    (N'HuddleResources', N'IsGlobal'), (N'HuddleMcemStages', N'StageNumber')
) AS x([TableName], [ColumnName])
WHERE NOT EXISTS (
    SELECT 1 FROM sys.columns c
    WHERE c.object_id = OBJECT_ID(N'dbo.' + x.[TableName], 'U') AND c.name = x.[ColumnName]);

-- The filtered indexes are what let placement rows and pre-V4 topic-scoped rows coexist.
INSERT INTO @missing ([Object], [Detail])
SELECT N'index on dbo.' + x.[TableName], N'No filtered unique index found. The migration may be incomplete.'
FROM (VALUES (N'HuddleActivities'), (N'HuddlePhases'), (N'HuddleFacilitatorGuides')) AS x([TableName])
WHERE NOT EXISTS (
    SELECT 1 FROM sys.indexes i
    WHERE i.object_id = OBJECT_ID(N'dbo.' + x.[TableName], 'U') AND i.has_filter = 1 AND i.is_unique = 1);

-- Duplicate role abbreviations *within Huddle's own ROLE-* rows* break the joins in scripts 02
-- and 03 (a genuine data problem worth stopping for). Scoped to ROLE-* only, not all of
-- dbo.Roles: that table is shared with the Workflow Builder module (seeded separately by
-- database/fresh-install/10_Workflow_Roles.sql / 001-upsert-roles.sql), and 7 of its
-- abbreviations (AE, ATS, CE, CSA, CSAM, SE, SSP) already coincide with Huddle's own by design --
-- checking the whole table would flag that known, harmless overlap as a failure on every run.
INSERT INTO @missing ([Object], [Detail])
SELECT N'dbo.Roles.' + r.Abbreviation,
       N'Abbreviation appears ' + CAST(COUNT(*) AS NVARCHAR(10)) + N' times among Huddle (ROLE-*) roles. Run huddle-v4-reset/00_REPAIR_Remove_Duplicate_Roles.sql.'
FROM dbo.Roles r WHERE r.ExternalId LIKE N'ROLE-%' GROUP BY r.Abbreviation HAVING COUNT(*) > 1;

IF EXISTS (SELECT 1 FROM @missing)
BEGIN
    SELECT [Object], [Detail] FROM @missing ORDER BY [Object];
    THROW 51000, 'Preflight failed. The result set above lists what is wrong.', 1;
END

SELECT N'Preflight passed. Schema and roles are ready for the huddle-v4 data scripts.' AS [Status];
GO
