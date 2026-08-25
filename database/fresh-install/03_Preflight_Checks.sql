/* =============================================================================================
   03_Preflight_Checks.sql

   Read-only. Run this after the schema script and before any data script. It answers two
   questions: did the schema land completely, and is this database empty.

   Nothing here writes. If any check fails, stop and fix it rather than continuing.
   ============================================================================================= */

SET NOCOUNT ON;

PRINT '=== Check 1: migration history ===';

SELECT [MigrationId], [ProductVersion]
FROM dbo.__EFMigrationsHistory
ORDER BY [MigrationId];

IF NOT EXISTS (SELECT 1 FROM dbo.__EFMigrationsHistory
               WHERE [MigrationId] = N'20260821114851_AddUserHuddlePlanItemPlacement')
BEGIN
    RAISERROR('FAIL: the schema script has not been applied. Run 02_Schema_All_Migrations.sql first.', 16, 1);
    RETURN;
END;

PRINT 'OK: all migrations present, including AddUserHuddlePlanItemPlacement.';
PRINT '';

PRINT '=== Check 2: every table the data scripts write to exists ===';

DECLARE @Required TABLE ([TableName] sysname NOT NULL PRIMARY KEY);
INSERT INTO @Required ([TableName]) VALUES
    -- Workflow module
    (N'Roles'), (N'AiTools'), (N'WorkflowBuckets'), (N'Activities'), (N'ActivityAiTools'),
    -- Huddle reference data
    (N'HuddleSegments'), (N'HuddleSegmentRoles'), (N'HuddleFocusAreas'), (N'HuddleMcemStages'),
    -- Huddle content
    (N'HuddleTopics'), (N'HuddleTopicRoles'), (N'HuddlePlacements'), (N'HuddleRolePathItems'),
    (N'HuddlePhases'), (N'HuddleActivities'), (N'HuddleFacilitatorGuides'),
    (N'HuddleAgents'), (N'HuddleResources'),
    (N'HuddleTopicMcemStages'), (N'HuddleTopicAgents'), (N'HuddleTopicResources'),
    (N'HuddleActivityAgents'), (N'HuddleActivityResources'), (N'HuddleAgentResources');

SELECT r.[TableName] AS [MissingTable]
FROM @Required r
WHERE OBJECT_ID(N'dbo.' + QUOTENAME(r.[TableName]), N'U') IS NULL;

IF EXISTS (SELECT 1 FROM @Required r
           WHERE OBJECT_ID(N'dbo.' + QUOTENAME(r.[TableName]), N'U') IS NULL)
BEGIN
    RAISERROR('FAIL: one or more required tables are missing. See the list above.', 16, 1);
    RETURN;
END;

PRINT 'OK: all 24 target tables exist.';
PRINT '';

PRINT '=== Check 3: the V4 columns the huddle scripts write ===';

DECLARE @Columns TABLE ([TableName] sysname NOT NULL, [ColumnName] sysname NOT NULL);
INSERT INTO @Columns VALUES
    (N'HuddlePlacements', N'PathSection'),
    (N'HuddlePlacements', N'Sequence'),
    (N'HuddlePlacements', N'RoleTopicName'),
    (N'HuddlePlacements', N'RoleTopicDescription'),
    (N'HuddleActivities',  N'HuddlePlacementId'),
    (N'HuddleActivities',  N'PracticeTier'),
    (N'HuddleActivities',  N'ExecutionMethod'),
    (N'HuddleActivities',  N'PrerequisiteHuddleActivityId'),
    (N'HuddlePhases',      N'HuddlePlacementId'),
    (N'HuddleFacilitatorGuides', N'HuddlePlacementId'),
    (N'HuddleFacilitatorGuides', N'ReflectPrompt'),
    (N'HuddleFacilitatorGuides', N'CommitPrompt'),
    (N'HuddleFacilitatorGuides', N'BringBackEvidence'),
    (N'HuddleMcemStages',  N'StageNumber'),
    (N'UserHuddlePlanItems', N'HuddlePlacementId');

SELECT c.[TableName], c.[ColumnName] AS [MissingColumn]
FROM @Columns c
WHERE NOT EXISTS (
    SELECT 1 FROM sys.columns sc
    WHERE sc.[object_id] = OBJECT_ID(N'dbo.' + QUOTENAME(c.[TableName]), N'U')
      AND sc.[name] = c.[ColumnName]);

IF EXISTS (
    SELECT 1 FROM @Columns c
    WHERE NOT EXISTS (
        SELECT 1 FROM sys.columns sc
        WHERE sc.[object_id] = OBJECT_ID(N'dbo.' + QUOTENAME(c.[TableName]), N'U')
          AND sc.[name] = c.[ColumnName]))
BEGIN
    RAISERROR('FAIL: one or more V4 columns are missing. The schema script did not fully apply.', 16, 1);
    RETURN;
END;

PRINT 'OK: all V4 columns present.';
PRINT '';

PRINT '=== Check 4: is this database empty ===';
PRINT 'A fresh install expects zeros. Non-zero is not an error: every data script is a MERGE and';
PRINT 'updates rows in place. But if you expected an empty database, stop and find out why.';

SELECT 'Roles'                  AS [Table], COUNT(*) AS [Rows] FROM dbo.Roles
UNION ALL SELECT 'AiTools',               COUNT(*) FROM dbo.AiTools
UNION ALL SELECT 'WorkflowBuckets',       COUNT(*) FROM dbo.WorkflowBuckets
UNION ALL SELECT 'Activities',            COUNT(*) FROM dbo.Activities
UNION ALL SELECT 'ActivityAiTools',       COUNT(*) FROM dbo.ActivityAiTools
UNION ALL SELECT 'HuddleTopics',          COUNT(*) FROM dbo.HuddleTopics
UNION ALL SELECT 'HuddlePlacements',      COUNT(*) FROM dbo.HuddlePlacements
UNION ALL SELECT 'HuddleActivities',      COUNT(*) FROM dbo.HuddleActivities
UNION ALL SELECT 'HuddleFacilitatorGuides', COUNT(*) FROM dbo.HuddleFacilitatorGuides
UNION ALL SELECT 'UserHuddlePlans (user data)',    COUNT(*) FROM dbo.UserHuddlePlans
UNION ALL SELECT 'UserHuddleSessions (user data)', COUNT(*) FROM dbo.UserHuddleSessions
ORDER BY [Table];

PRINT '';
PRINT 'Preflight complete. If every check said OK, continue with 10_Workflow_Roles.sql.';
