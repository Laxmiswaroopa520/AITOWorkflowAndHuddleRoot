/* =============================================================================================
   40_Validate_Everything.sql

   Read-only. Run last. Confirms both modules loaded, then runs integrity assertions that fail
   loudly rather than returning a quietly wrong row count.

   Expected counts come from the SharePoint exports (Workflow, unchanged) and the V10.2.1
   Frontier Accelerator content workbook (Huddle). A count HIGHER than expected is a pass: every
   data script is a MERGE, so re-running adds nothing, but a database that also holds other seed
   rows will read high. A count LOWER than expected means a script did not finish.
   ============================================================================================= */

SET NOCOUNT ON;

/* ------------------------------------------------------------------ Workflow module */
PRINT '=== Workflow module ===';

SELECT [Table], [Actual], [Expected],
       CASE WHEN [Actual] >= [Expected] THEN 'OK' ELSE 'SHORT' END AS [Result]
FROM (
    SELECT 'Roles'            AS [Table], COUNT(*) AS [Actual], 21  AS [Expected] FROM dbo.Roles
    UNION ALL SELECT 'AiTools',           COUNT(*), 14  FROM dbo.AiTools
    UNION ALL SELECT 'WorkflowBuckets',   COUNT(*), 9   FROM dbo.WorkflowBuckets
    UNION ALL SELECT 'Activities',        COUNT(*), 186 FROM dbo.Activities
    UNION ALL SELECT 'ActivityAiTools',   COUNT(*), 215 FROM dbo.ActivityAiTools
) w
ORDER BY [Table];

PRINT 'Roles expects 21: 8 rows owned by the Workflow Builder module (script 10) plus 13 owned by';
PRINT 'the Huddle module (script 20) -- 8 Enterprise-only Huddle roles plus 5 new SME&C-only roles';
PRINT '(DAE, DSS, DSE, DCSA, PSS). dbo.Roles is shared between the two modules and 7 abbreviations';
PRINT '(AE, ATS, CE, CSA, CSAM, SE, SSP) legitimately appear twice -- once as the Workflow Builder''s';
PRINT 'own row, once as the Huddle module''s ROLE-* row for the same letters. That overlap is by';
PRINT 'design (see the Duplicate role abbreviation check further down, which is scoped to avoid';
PRINT 'flagging it) and does not cause any problem as long as nothing joins on Abbreviation.';
PRINT '';

/* ------------------------------------------------------------------ Huddle module */
PRINT '=== Huddle module ===';

SELECT [Table], [Actual], [Expected],
       CASE WHEN [Actual] >= [Expected] THEN 'OK' ELSE 'SHORT' END AS [Result]
FROM (
    SELECT 'HuddleSegments'          AS [Table], COUNT(*) AS [Actual], 2   AS [Expected] FROM dbo.HuddleSegments
    UNION ALL SELECT 'HuddleSegmentRoles',       COUNT(*), 15  FROM dbo.HuddleSegmentRoles
    UNION ALL SELECT 'HuddleFocusAreas',         COUNT(*), 8   FROM dbo.HuddleFocusAreas
    UNION ALL SELECT 'HuddleMcemStages',         COUNT(*), 5   FROM dbo.HuddleMcemStages
    UNION ALL SELECT 'HuddleTopics',             COUNT(*), 25  FROM dbo.HuddleTopics
    UNION ALL SELECT 'HuddleTopicRoles',         COUNT(*), 118 FROM dbo.HuddleTopicRoles
    UNION ALL SELECT 'HuddlePlacements',         COUNT(*), 103 FROM dbo.HuddlePlacements
    UNION ALL SELECT 'HuddleRolePathItems',      COUNT(*), 74  FROM dbo.HuddleRolePathItems
    UNION ALL SELECT 'HuddlePhases',             COUNT(*), 309 FROM dbo.HuddlePhases
    UNION ALL SELECT 'HuddleFacilitatorGuides',  COUNT(*), 103 FROM dbo.HuddleFacilitatorGuides
    UNION ALL SELECT 'HuddleAgents',             COUNT(*), 18  FROM dbo.HuddleAgents
    UNION ALL SELECT 'HuddleResources',          COUNT(*), 51  FROM dbo.HuddleResources
    UNION ALL SELECT 'HuddleActivities',         COUNT(*), 403 FROM dbo.HuddleActivities
    UNION ALL SELECT 'HuddleTopicMcemStages',    COUNT(*), 23  FROM dbo.HuddleTopicMcemStages
    UNION ALL SELECT 'HuddleTopicAgents',        COUNT(*), 63  FROM dbo.HuddleTopicAgents
    UNION ALL SELECT 'HuddleTopicResources',     COUNT(*), 21  FROM dbo.HuddleTopicResources
    UNION ALL SELECT 'HuddleActivityAgents',     COUNT(*), 433 FROM dbo.HuddleActivityAgents
    UNION ALL SELECT 'HuddleActivityResources',  COUNT(*), 152 FROM dbo.HuddleActivityResources
    UNION ALL SELECT 'HuddleAgentResources',     COUNT(*), 23  FROM dbo.HuddleAgentResources
) h
ORDER BY [Table];

PRINT 'HuddleTopicAgents expects 63, not the 65 rows physically in the workbook''s Topic_Agents';
PRINT 'sheet: 2 rows for WF-X-TRANSITION-01 are missing UsageType/DisplayOrder and were skipped';
PRINT 'rather than guessed at. See SKIPPED_ROWS.md. Fill those in and re-run the generator to bring';
PRINT 'this up to 65.';
PRINT '';

/* ------------------------------------------------------------------ Roles by segment */
PRINT '=== Huddle roles by segment ===';

SELECT r.[Segment], COUNT(*) AS [RoleCount], STRING_AGG(r.[Abbreviation], N', ') AS [Abbreviations]
FROM dbo.Roles r
WHERE r.[ExternalId] LIKE N'ROLE-%'
GROUP BY r.[Segment]
ORDER BY r.[Segment];

PRINT 'Expect Enterprise = 8 (ALL, AE, ATS, CE, CSA, CSAM, SE, SSP), SME&C = 5 (DAE, DCSA, DSE, DSS,';
PRINT 'PSS). Commercial Executive (CE) is linked to both segments in HuddleSegmentRoles, but this';
PRINT 'denormalised Roles.Segment column carries only the segment it first appears under, so it';
PRINT 'reads under Enterprise here -- that is expected, not a gap.';
PRINT '';

/* ------------------------------------------------------------------ Role paths */
PRINT '=== Role paths: every segment-role''s weekly sequence must be contiguous from 1 ===';
PRINT 'Shape varies by design in V10.2.1, so this reports the shape rather than asserting one fixed';
PRINT 'week count for every role:';
PRINT '  - the 7 Enterprise role paths (AE, ATS, CE, CSA, CSAM, SE, SSP) and SME&C''s DAE run 8 weeks';
PRINT '  - SME&C''s DSS runs 6 weeks, and SME&C''s CE (a second, shorter path for the same role) runs 4';
PRINT '  - ALL, and SME&C''s DCSA/DSE/PSS, have no weekly path at all -- Additional Content only';
PRINT 'What must always hold, regardless of length, is CONTIGUOUS: no gaps, starting at week 1.';

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

IF EXISTS (
    SELECT 1 FROM dbo.HuddlePlacements p
    JOIN dbo.HuddleSegmentRoles sr ON sr.[Id] = p.[HuddleSegmentRoleId]
    WHERE p.[PathSection] IN (N'SEC-ORIENTATION', N'SEC-ROLEPATH') AND p.[IsActive] = 1
    GROUP BY sr.[ExternalId]
    HAVING NOT (MIN(p.[Sequence]) = 1 AND MAX(p.[Sequence]) = COUNT(*))
)
    THROW 51002, 'A segment-role''s weekly sequence has a gap or does not start at week 1. See the [Result] column above.', 1;

PRINT '';

PRINT '=== Additional content per segment-role ===';

SELECT sr.[ExternalId] AS [SegmentRole], COUNT(*) AS [AdditionalPlacements]
FROM dbo.HuddlePlacements p
JOIN dbo.HuddleSegmentRoles sr ON sr.[Id] = p.[HuddleSegmentRoleId]
WHERE p.[PathSection] = N'SEC-ADDITIONAL' AND p.[IsActive] = 1
GROUP BY sr.[ExternalId]
ORDER BY sr.[ExternalId];

PRINT 'Expect 29 additional placements total: AE 4, ALL 8, ATS 5, CE(Enterprise) 1, CSA 1, CSAM 2,';
PRINT 'SE 2, SSP 2, DCSA 1, DSE 1, PSS 2 (CE-SME&C and DAE and DSS have none).';
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

PRINT 'Expect Role path 165 Featured / 120 Extended, Additional content 99 Featured / 19 Extended';
PRINT '(403 activities total: 264 Featured, 139 Extended).';
PRINT '';

/* ------------------------------------------------------------------ Integrity assertions (fail fast) */
PRINT '=== Structural integrity assertions (these throw immediately) ===';

IF EXISTS (SELECT 1 FROM dbo.HuddlePlacements WHERE [HuddleTopicId] IS NULL OR [HuddleSegmentRoleId] IS NULL)
    THROW 51001, 'A placement is missing its topic or its segment role.', 1;

IF EXISTS (SELECT 1 FROM dbo.HuddlePlacements GROUP BY [HuddleSegmentRoleId], [PathSection], [Sequence] HAVING COUNT(*) > 1)
    THROW 51003, 'Two placements share the same segment role, section and sequence.', 1;

IF EXISTS (SELECT 1 FROM dbo.HuddleActivities WHERE [HuddlePlacementId] IS NULL)
    THROW 51004, 'An activity is not attached to a placement.', 1;

IF EXISTS (SELECT 1 FROM dbo.HuddleActivities WHERE [PracticeTier] NOT IN (N'Featured', N'Extended'))
    THROW 51005, 'An activity has a PracticeTier outside Featured and Extended.', 1;

IF EXISTS (SELECT 1 FROM dbo.HuddleActivities a
           WHERE a.[PrerequisiteHuddleActivityId] IS NOT NULL
             AND NOT EXISTS (SELECT 1 FROM dbo.HuddleActivities p WHERE p.[Id] = a.[PrerequisiteHuddleActivityId]))
    THROW 51006, 'An activity prerequisite points at an activity that does not exist.', 1;

IF EXISTS (SELECT 1 FROM dbo.HuddleActivities WHERE [PrerequisiteHuddleActivityId] = [Id])
    THROW 51007, 'An activity is its own prerequisite.', 1;

-- A prerequisite may span two placements for the same topic and role (this is how, e.g., the CSA
-- architecture Huddle's two-part chain works, by design). Only a cross-topic or cross-role
-- reference is a genuine content error.
IF EXISTS (
    SELECT 1 FROM dbo.HuddleActivities a
    INNER JOIN dbo.HuddleActivities pre ON pre.Id = a.PrerequisiteHuddleActivityId
    INNER JOIN dbo.HuddlePlacements ap ON ap.Id = a.HuddlePlacementId
    INNER JOIN dbo.HuddlePlacements pp ON pp.Id = pre.HuddlePlacementId
    WHERE ap.HuddleTopicId <> pp.HuddleTopicId OR ap.HuddleSegmentRoleId <> pp.HuddleSegmentRoleId
)
    THROW 51008, 'An activity prerequisite crosses a topic or role. Check the workbook.', 1;

IF EXISTS (SELECT 1 FROM dbo.HuddlePlacements p
           WHERE NOT EXISTS (SELECT 1 FROM dbo.HuddlePhases ph WHERE ph.[HuddlePlacementId] = p.[Id]))
    THROW 51009, 'A placement has no phases.', 1;

IF EXISTS (SELECT 1 FROM dbo.HuddlePlacements p
           WHERE (SELECT COUNT(*) FROM dbo.HuddlePhases ph WHERE ph.[HuddlePlacementId] = p.[Id]) <> 3)
    THROW 51010, 'A placement does not have exactly three phases.', 1;

-- Orientation placements deliberately carry no activities in the workbook.
IF EXISTS (SELECT 1 FROM dbo.HuddlePlacements p
           WHERE p.[PathSection] <> N'SEC-ORIENTATION'
             AND NOT EXISTS (SELECT 1 FROM dbo.HuddleActivities a WHERE a.[HuddlePlacementId] = p.[Id]))
    THROW 51011, 'A non-orientation placement has no activities.', 1;

IF EXISTS (SELECT 1 FROM dbo.HuddlePlacements p
           WHERE NOT EXISTS (SELECT 1 FROM dbo.HuddleFacilitatorGuides g WHERE g.[HuddlePlacementId] = p.[Id]))
    THROW 51012, 'A placement has no facilitator guide.', 1;

IF EXISTS (SELECT 1 FROM dbo.HuddleFacilitatorGuides
           WHERE [HuddlePlacementId] IS NOT NULL AND ([ReflectPrompt] IS NULL OR [CommitPrompt] IS NULL))
    THROW 51013, 'A placement guide is missing its Reflect or Commit prompt. The HTML export will show placeholders.', 1;

IF EXISTS (SELECT 1 FROM dbo.Activities a WHERE NOT EXISTS (SELECT 1 FROM dbo.Roles r WHERE r.[Id] = a.[RoleId]))
    THROW 51014, 'A Workflow activity points at a role that does not exist.', 1;

IF EXISTS (SELECT 1 FROM dbo.Activities a
           WHERE NOT EXISTS (SELECT 1 FROM dbo.ActivityAiTools m WHERE m.[ActivityId] = a.[Id]))
    THROW 51015, 'A Workflow activity has no AI tool mapping.', 1;

-- Scoped to Huddle's own ROLE-* rows, not all of dbo.Roles. That table is shared with the
-- Workflow Builder module, and 7 abbreviations (AE, ATS, CE, CSA, CSAM, SE, SSP) already coincide
-- with Huddle's own by design (see the note under "Workflow module" above) -- harmless as long as
-- nothing joins on Abbreviation. What this needs to guard is Huddle's own roles never colliding
-- with each other.
IF EXISTS (SELECT 1 FROM dbo.Roles r WHERE r.[ExternalId] LIKE N'ROLE-%' GROUP BY r.[Abbreviation] HAVING COUNT(*) > 1)
    THROW 51016, 'Two Huddle roles (ROLE-*) share an abbreviation.', 1;

-- A role should carry exactly one Segment value even though HuddleSegmentRoles can legitimately
-- link it to more than one segment (Commercial Executive spans Enterprise and SME&C by design).
IF EXISTS (SELECT 1 FROM dbo.Roles r WHERE r.[ExternalId] LIKE N'ROLE-%' AND (r.[Segment] IS NULL OR r.[Segment] = N''))
    THROW 51017, 'A Huddle role is missing a Segment value.', 1;

IF EXISTS (SELECT 1 FROM dbo.HuddleMcemStages m WHERE m.[StageNumber] IS NULL)
    THROW 51018, 'An MCEM stage is missing its StageNumber.', 1;

IF EXISTS (SELECT 1 FROM dbo.HuddleActivityAgents aa
           WHERE aa.[UsageType] NOT IN (N'Primary', N'Secondary', N'Surfaced', N'Alternate'))
    THROW 51019, 'A HuddleActivityAgents row has a UsageType outside Primary/Secondary/Surfaced/Alternate.', 1;

IF EXISTS (SELECT 1 FROM dbo.HuddleActivities a
           WHERE a.[LaunchUrl] IS NOT NULL AND LEFT(a.[LaunchUrl], 8) <> N'https://')
    THROW 51020, 'An activity LaunchUrl is not https.', 1;

IF EXISTS (SELECT 1 FROM dbo.HuddleActivities a
           WHERE a.[HuddlePlacementId] IS NOT NULL AND a.[Prompt] IS NULL AND a.[ActivitySteps] IS NULL)
    THROW 51021, 'An activity has neither a Prompt nor ActivitySteps.', 1;

-- The 6 ECIF-related activities should each carry exactly one agent row: ECIF Agent as Primary,
-- "surfaced through Sales Agent" in the label. On a fresh install this is naturally true from the
-- first MERGE (there is no stale prior row to collide with, unlike when this same content was
-- applied on top of an existing V8.0 database) -- this assertion just confirms it stayed true.
IF EXISTS (
    SELECT a.[ExternalId]
    FROM dbo.HuddleActivities a
    WHERE a.[ExternalId] IN (N'AE-03-ECIF-01', N'CE-05-ECIF-01', N'CSA-02-ECIF-01', N'SE-01-ECIF-01',
                              N'WF-X-ORCH-01-P-ATS-ECIF02', N'WF-X-ORCH-01-P-ATS-ECIF03')
    GROUP BY a.[ExternalId], a.[Id]
    HAVING (SELECT COUNT(*) FROM dbo.HuddleActivityAgents aa WHERE aa.[HuddleActivityId] = a.[Id]) <> 1
)
    THROW 51022, 'At least one of the 6 ECIF activities does not have exactly one agent row.', 1;

PRINT 'All integrity assertions passed.';
PRINT '';
PRINT '=== Validation complete ===';
PRINT 'If every Result read OK and no assertion threw, the database is ready for the application.';
