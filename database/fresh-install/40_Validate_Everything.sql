/* =============================================================================================
   40_Validate_Everything.sql

   Read-only. Run last. Confirms both modules loaded, then runs integrity assertions that fail
   loudly rather than returning a quietly wrong row count.

   Expected counts come from the SharePoint exports (Workflow) and App Data Final.xlsx (Huddle).
   A count HIGHER than expected is a pass: every data script is a MERGE, so re-running adds
   nothing, but a database that also holds pre-V4 seed rows will read high. A count LOWER than
   expected means a script did not finish.
   ============================================================================================= */

SET NOCOUNT ON;

/* ------------------------------------------------------------------ Workflow module */
PRINT '=== Workflow module ===';

SELECT [Table], [Actual], [Expected],
       CASE WHEN [Actual] >= [Expected] THEN 'OK' ELSE 'SHORT' END AS [Result]
FROM (
    SELECT 'Roles'            AS [Table], COUNT(*) AS [Actual], 9   AS [Expected] FROM dbo.Roles
    UNION ALL SELECT 'AiTools',           COUNT(*), 14  FROM dbo.AiTools
    UNION ALL SELECT 'WorkflowBuckets',   COUNT(*), 9   FROM dbo.WorkflowBuckets
    UNION ALL SELECT 'Activities',        COUNT(*), 186 FROM dbo.Activities
    UNION ALL SELECT 'ActivityAiTools',   COUNT(*), 215 FROM dbo.ActivityAiTools
) w
ORDER BY [Table];

PRINT 'Roles expects 9: eight from the Workflow export plus ROLE-ALL, which the Huddle workbook adds.';
PRINT '';

/* ------------------------------------------------------------------ Huddle module */
PRINT '=== Huddle module ===';

SELECT [Table], [Actual], [Expected],
       CASE WHEN [Actual] >= [Expected] THEN 'OK' ELSE 'SHORT' END AS [Result]
FROM (
    SELECT 'HuddleSegments'          AS [Table], COUNT(*) AS [Actual], 1   AS [Expected] FROM dbo.HuddleSegments
    UNION ALL SELECT 'HuddleSegmentRoles',       COUNT(*), 8   FROM dbo.HuddleSegmentRoles
    UNION ALL SELECT 'HuddleFocusAreas',         COUNT(*), 8   FROM dbo.HuddleFocusAreas
    UNION ALL SELECT 'HuddleMcemStages',         COUNT(*), 5   FROM dbo.HuddleMcemStages
    UNION ALL SELECT 'HuddleTopics',             COUNT(*), 16  FROM dbo.HuddleTopics
    UNION ALL SELECT 'HuddlePlacements',         COUNT(*), 70  FROM dbo.HuddlePlacements
    UNION ALL SELECT 'HuddlePhases',             COUNT(*), 210 FROM dbo.HuddlePhases
    UNION ALL SELECT 'HuddleFacilitatorGuides',  COUNT(*), 70  FROM dbo.HuddleFacilitatorGuides
    UNION ALL SELECT 'HuddleAgents',             COUNT(*), 18  FROM dbo.HuddleAgents
    UNION ALL SELECT 'HuddleResources',          COUNT(*), 49  FROM dbo.HuddleResources
    UNION ALL SELECT 'HuddleActivities',         COUNT(*), 281 FROM dbo.HuddleActivities
    UNION ALL SELECT 'HuddleTopicMcemStages',    COUNT(*), 23  FROM dbo.HuddleTopicMcemStages
    UNION ALL SELECT 'HuddleTopicAgents',        COUNT(*), 63  FROM dbo.HuddleTopicAgents
    UNION ALL SELECT 'HuddleTopicResources',     COUNT(*), 19  FROM dbo.HuddleTopicResources
    UNION ALL SELECT 'HuddleActivityAgents',     COUNT(*), 317 FROM dbo.HuddleActivityAgents
    UNION ALL SELECT 'HuddleActivityResources',  COUNT(*), 152 FROM dbo.HuddleActivityResources
    UNION ALL SELECT 'HuddleAgentResources',     COUNT(*), 22  FROM dbo.HuddleAgentResources
) h
ORDER BY [Table];

PRINT '';

/* ------------------------------------------------------------------ Role paths */
PRINT '=== Role paths: every role must be a contiguous run of weeks from 1 ===';

SELECT sr.[ExternalId]                                            AS [SegmentRole],
       COUNT(*)                                                   AS [Weeks],
       MIN(p.[Sequence])                                          AS [FirstWeek],
       MAX(p.[Sequence])                                          AS [LastWeek],
       COUNT(DISTINCT p.[HuddleTopicId])                           AS [DistinctTopics],
       CASE WHEN MIN(p.[Sequence]) = 1 AND MAX(p.[Sequence]) = COUNT(*)
            THEN 'OK' ELSE 'BROKEN' END                           AS [Result]
FROM dbo.HuddlePlacements p
JOIN dbo.HuddleSegmentRoles sr ON sr.[Id] = p.[HuddleSegmentRoleId]
WHERE p.[PathSection] IN (N'SEC-ORIENTATION', N'SEC-ROLEPATH') AND p.[IsActive] = 1
GROUP BY sr.[ExternalId]
ORDER BY sr.[ExternalId];

PRINT 'Expect 7 rows, Weeks = 8, FirstWeek = 1, LastWeek = 8, all OK.';
PRINT 'DistinctTopics is deliberately less than 8: a role revisits topics across weeks.';
PRINT '';

PRINT '=== Additional content per role (what Additional Topics shows) ===';

SELECT sr.[ExternalId] AS [SegmentRole], COUNT(*) AS [AdditionalPlacements]
FROM dbo.HuddlePlacements p
JOIN dbo.HuddleSegmentRoles sr ON sr.[Id] = p.[HuddleSegmentRoleId]
WHERE p.[PathSection] = N'SEC-ADDITIONAL' AND p.[IsActive] = 1
GROUP BY sr.[ExternalId]
ORDER BY sr.[ExternalId];

PRINT 'Expect 14 placements total: ATS 4, AE 3, ALL 2, and CE / CSA / CSAM / SE / SSP one each.';
PRINT '';

/* ------------------------------------------------------------------ Practice tier */
PRINT '=== Activity practice tier split ===';

SELECT CASE WHEN p.[PathSection] = N'SEC-ADDITIONAL' THEN N'Additional content'
            ELSE N'Role path' END      AS [Section],
       a.[PracticeTier],
       COUNT(*)                        AS [Activities]
FROM dbo.HuddleActivities a
JOIN dbo.HuddlePlacements p ON p.[Id] = a.[HuddlePlacementId]
GROUP BY CASE WHEN p.[PathSection] = N'SEC-ADDITIONAL' THEN N'Additional content' ELSE N'Role path' END,
         a.[PracticeTier]
ORDER BY [Section], a.[PracticeTier];

PRINT 'Expect Role path 122 Featured / 103 Extended, Additional content 54 Featured / 2 Extended.';
PRINT '';

/* ------------------------------------------------------------------ Integrity assertions */
PRINT '=== Integrity assertions (these throw rather than print) ===';

IF EXISTS (SELECT 1 FROM dbo.HuddlePlacements WHERE [HuddleTopicId] IS NULL OR [HuddleSegmentRoleId] IS NULL)
    THROW 51001, 'A placement is missing its topic or its segment role.', 1;

IF EXISTS (SELECT 1 FROM dbo.HuddlePlacements GROUP BY [HuddleSegmentRoleId], [PathSection], [Sequence] HAVING COUNT(*) > 1)
    THROW 51002, 'Two placements share the same segment role, section and sequence.', 1;

IF EXISTS (SELECT 1 FROM dbo.HuddleActivities WHERE [HuddlePlacementId] IS NULL)
    THROW 51003, 'An activity is not attached to a placement.', 1;

IF EXISTS (SELECT 1 FROM dbo.HuddleActivities WHERE [PracticeTier] NOT IN (N'Featured', N'Extended'))
    THROW 51004, 'An activity has a PracticeTier outside Featured and Extended.', 1;

IF EXISTS (SELECT 1 FROM dbo.HuddleActivities a
           WHERE a.[PrerequisiteHuddleActivityId] IS NOT NULL
             AND NOT EXISTS (SELECT 1 FROM dbo.HuddleActivities p WHERE p.[Id] = a.[PrerequisiteHuddleActivityId]))
    THROW 51005, 'An activity prerequisite points at an activity that does not exist.', 1;

IF EXISTS (SELECT 1 FROM dbo.HuddleActivities WHERE [PrerequisiteHuddleActivityId] = [Id])
    THROW 51006, 'An activity is its own prerequisite.', 1;

IF EXISTS (SELECT 1 FROM dbo.HuddlePlacements p
           WHERE NOT EXISTS (SELECT 1 FROM dbo.HuddlePhases ph WHERE ph.[HuddlePlacementId] = p.[Id]))
    THROW 51007, 'A placement has no phases.', 1;

IF EXISTS (SELECT 1 FROM dbo.HuddlePlacements p
           WHERE (SELECT COUNT(*) FROM dbo.HuddlePhases ph WHERE ph.[HuddlePlacementId] = p.[Id]) <> 3)
    THROW 51008, 'A placement does not have exactly three phases.', 1;

IF EXISTS (SELECT 1 FROM dbo.HuddlePlacements p
           WHERE NOT EXISTS (SELECT 1 FROM dbo.HuddleFacilitatorGuides g WHERE g.[HuddlePlacementId] = p.[Id]))
    THROW 51009, 'A placement has no facilitator guide.', 1;

IF EXISTS (SELECT 1 FROM dbo.HuddleFacilitatorGuides
           WHERE [HuddlePlacementId] IS NOT NULL AND ([ReflectPrompt] IS NULL OR [CommitPrompt] IS NULL))
    THROW 51010, 'A placement guide is missing its Reflect or Commit prompt. The HTML export will show placeholders.', 1;

IF EXISTS (SELECT 1 FROM dbo.Activities a WHERE NOT EXISTS (SELECT 1 FROM dbo.Roles r WHERE r.[Id] = a.[RoleId]))
    THROW 51011, 'A Workflow activity points at a role that does not exist.', 1;

IF EXISTS (SELECT 1 FROM dbo.Activities a
           WHERE NOT EXISTS (SELECT 1 FROM dbo.ActivityAiTools m WHERE m.[ActivityId] = a.[Id]))
    THROW 51012, 'A Workflow activity has no AI tool mapping.', 1;

IF EXISTS (SELECT 1 FROM dbo.Roles GROUP BY [Abbreviation] HAVING COUNT(*) > 1)
    THROW 51013, 'Two roles share an abbreviation. The Huddle scripts join on Abbreviation and will double-count.', 1;

PRINT 'All integrity assertions passed.';
PRINT '';
PRINT '=== Validation complete ===';
PRINT 'If every Result read OK and no assertion threw, the database is ready for the application.';
