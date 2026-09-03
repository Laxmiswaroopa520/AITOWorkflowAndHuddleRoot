/*
    Validation. Run last (after 13_Cleanup_Stale_ECIF_ActivityAgents.sql). Read-only: it reports
    and it raises, it never writes.

    Expected counts below match huddle-v10.2.1/expected_counts.txt, generated straight from the
    V10.2.1 workbook, with one adjustment: HuddleTopicAgents is 63, not the 65 rows physically in
    the Topic_Agents sheet -- 2 of those 65 rows (both for WF-X-TRANSITION-01) are missing
    DisplayOrder and were skipped by the generator rather than guessed at. See
    huddle-v10.2.1/SKIPPED_ROWS.md. Complete those 2 rows in the workbook and re-run the generator
    to bring HuddleTopicAgents up to the full 65.
*/
SET NOCOUNT ON;

PRINT '--- Row counts: workbook versus database ---';

DECLARE @expected TABLE ([TableName] SYSNAME, [Expected] INT);
INSERT INTO @expected ([TableName], [Expected]) VALUES
    (N'HuddleActivities', 403),
    (N'HuddleActivityAgents', 433),
    (N'HuddleActivityResources', 152),
    (N'HuddleAgentResources', 23),
    (N'HuddleAgents', 18),
    (N'HuddleFacilitatorGuides', 103),
    (N'HuddleFocusAreas', 8),
    (N'HuddleMcemStages', 5),
    (N'HuddlePhases', 309),
    (N'HuddlePlacements', 103),
    (N'HuddleResources', 51),
    (N'HuddleSegmentRoles', 15),
    (N'HuddleSegments', 2),
    (N'HuddleTopicAgents', 63),
    (N'HuddleTopicMcemStages', 23),
    (N'HuddleTopicResources', 21),
    (N'HuddleTopics', 25),
    (N'Roles', 13)
;

SELECT e.[TableName], e.[Expected], a.[Actual],
       CASE WHEN a.[Actual] >= e.[Expected] THEN N'OK'
            ELSE N'SHORT by ' + CAST(e.[Expected] - a.[Actual] AS NVARCHAR(20)) END AS [Result]
FROM @expected e
CROSS APPLY (
    SELECT SUM(p.rows) AS [Actual] FROM sys.partitions p
    WHERE p.object_id = OBJECT_ID(N'dbo.' + e.[TableName], 'U') AND p.index_id IN (0, 1)
) a
ORDER BY e.[TableName];
-- Actual can exceed Expected where rows outside this workbook's scope remain -- e.g. Roles counts
-- every row in dbo.Roles, and that table is shared with the Workflow Builder module's own roles
-- (seeded separately by database/fresh-install/10_Workflow_Roles.sql), so Actual for Roles will
-- normally read higher than 13. HuddleActivityAgents should read exactly 433, not higher -- if it
-- reads 445, script 13's cleanup has not been run yet.

PRINT '--- Featured and Extended split per placement ---';
SELECT p.ExternalId AS [Placement], sr.DisplayName AS [Role], p.PathSection, p.[Sequence],
       SUM(CASE WHEN a.PracticeTier = N'Featured' THEN 1 ELSE 0 END) AS [Featured],
       SUM(CASE WHEN a.PracticeTier = N'Extended' THEN 1 ELSE 0 END) AS [Extended]
FROM dbo.HuddlePlacements p
INNER JOIN dbo.HuddleSegmentRoles sr ON sr.Id = p.HuddleSegmentRoleId
LEFT JOIN dbo.HuddleActivities a ON a.HuddlePlacementId = p.Id
GROUP BY p.ExternalId, sr.DisplayName, p.PathSection, p.[Sequence]
ORDER BY sr.DisplayName, p.PathSection, p.[Sequence];

PRINT '--- Activity chains that span two placements ---';
SELECT a.ExternalId AS [Activity], ap.ExternalId AS [Placement], a.PracticeTier,
       pre.ExternalId AS [RequiresOutputOf], pp.ExternalId AS [FromPlacement], pre.PracticeTier AS [PrerequisiteTier]
FROM dbo.HuddleActivities a
INNER JOIN dbo.HuddleActivities pre ON pre.Id = a.PrerequisiteHuddleActivityId
INNER JOIN dbo.HuddlePlacements ap ON ap.Id = a.HuddlePlacementId
INNER JOIN dbo.HuddlePlacements pp ON pp.Id = pre.HuddlePlacementId
WHERE ap.Id <> pp.Id
ORDER BY a.ExternalId;

PRINT '--- Roles by segment (new in V10.2.1: SME&C alongside Enterprise) ---';
SELECT r.Segment, COUNT(*) AS [RoleCount], STRING_AGG(r.Abbreviation, N', ') AS [Abbreviations]
FROM dbo.Roles r
WHERE r.ExternalId LIKE N'ROLE-%'
GROUP BY r.Segment
ORDER BY r.Segment;

PRINT '--- Integrity assertions ---';

DECLARE @problems TABLE ([Check] NVARCHAR(120), [Detail] NVARCHAR(400));

INSERT INTO @problems
SELECT N'Placement without three phases', p.ExternalId + N' has ' + CAST(COUNT(ph.Id) AS NVARCHAR(10)) + N' phases'
FROM dbo.HuddlePlacements p
LEFT JOIN dbo.HuddlePhases ph ON ph.HuddlePlacementId = p.Id
GROUP BY p.ExternalId HAVING COUNT(ph.Id) <> 3;

INSERT INTO @problems
SELECT N'Placement without a facilitator guide', p.ExternalId
FROM dbo.HuddlePlacements p
WHERE NOT EXISTS (SELECT 1 FROM dbo.HuddleFacilitatorGuides g WHERE g.HuddlePlacementId = p.Id);

-- Orientation placements deliberately carry no activities in the workbook.
INSERT INTO @problems
SELECT N'Placement has no activities', p.ExternalId
FROM dbo.HuddlePlacements p
WHERE p.PathSection <> N'SEC-ORIENTATION'
  AND NOT EXISTS (SELECT 1 FROM dbo.HuddleActivities a WHERE a.HuddlePlacementId = p.Id);

INSERT INTO @problems
SELECT N'Activity phase belongs to another placement', a.ExternalId + N' -> phase ' + ph.ExternalId
FROM dbo.HuddleActivities a
INNER JOIN dbo.HuddlePhases ph ON ph.Id = a.HuddlePhaseId
WHERE a.HuddlePlacementId IS NOT NULL AND ph.HuddlePlacementId <> a.HuddlePlacementId;

-- A prerequisite may point at an earlier placement for the same role and topic, which is how the
-- CSA architecture Huddles chain. Only a cross-topic or cross-role reference is a problem.
INSERT INTO @problems
SELECT N'Prerequisite crosses a topic or role', a.ExternalId + N' -> ' + pre.ExternalId
FROM dbo.HuddleActivities a
INNER JOIN dbo.HuddleActivities pre ON pre.Id = a.PrerequisiteHuddleActivityId
INNER JOIN dbo.HuddlePlacements ap ON ap.Id = a.HuddlePlacementId
INNER JOIN dbo.HuddlePlacements pp ON pp.Id = pre.HuddlePlacementId
WHERE ap.HuddleTopicId <> pp.HuddleTopicId OR ap.HuddleSegmentRoleId <> pp.HuddleSegmentRoleId;

INSERT INTO @problems
SELECT N'Activity is its own prerequisite', a.ExternalId
FROM dbo.HuddleActivities a WHERE a.PrerequisiteHuddleActivityId = a.Id;

INSERT INTO @problems
SELECT N'Unexpected PracticeTier', a.ExternalId + N' = ' + ISNULL(a.PracticeTier, N'(null)')
FROM dbo.HuddleActivities a WHERE a.PracticeTier NOT IN (N'Featured', N'Extended');

INSERT INTO @problems
SELECT N'Unexpected agent UsageType', CAST(aa.HuddleActivityId AS NVARCHAR(20)) + N' = ' + aa.UsageType
FROM dbo.HuddleActivityAgents aa
WHERE aa.UsageType NOT IN (N'Primary', N'Secondary', N'Surfaced', N'Alternate');

INSERT INTO @problems
SELECT N'LaunchUrl is not https', a.ExternalId + N' = ' + a.LaunchUrl
FROM dbo.HuddleActivities a
WHERE a.LaunchUrl IS NOT NULL AND LEFT(a.LaunchUrl, 8) <> N'https://';

INSERT INTO @problems
SELECT N'Activity has neither prompt nor steps', a.ExternalId
FROM dbo.HuddleActivities a
WHERE a.HuddlePlacementId IS NOT NULL AND a.Prompt IS NULL AND a.ActivitySteps IS NULL;

INSERT INTO @problems
SELECT N'MCEM stage number missing', m.ExternalId FROM dbo.HuddleMcemStages m WHERE m.StageNumber IS NULL;

-- Scoped to Huddle's own ROLE-* rows only, not all of dbo.Roles. That table is shared with the
-- Workflow Builder module (seeded separately by database/fresh-install/10_Workflow_Roles.sql /
-- 001-upsert-roles.sql), and 7 of its abbreviations (AE, ATS, CE, CSA, CSAM, SE, SSP) already
-- coincide with Huddle's own -- this predates V10.2.1 and predates this validator; it's the same
-- fact that made script 03's original Abbreviation-based join ambiguous (fixed there by joining on
-- ExternalId instead). It is harmless as long as nothing joins on Abbreviation, so checking the
-- whole table here would flag a known, accepted condition as a failure on every run. What this
-- check actually needs to guard is that Huddle's own roles never collide with each other.
INSERT INTO @problems
SELECT N'Duplicate role abbreviation among Huddle roles', r.Abbreviation
FROM dbo.Roles r WHERE r.ExternalId LIKE N'ROLE-%' GROUP BY r.Abbreviation HAVING COUNT(*) > 1;

-- New for V10.2.1: a role should carry exactly one Segment value even though HuddleSegmentRoles
-- can legitimately link it to more than one segment (Commercial Executive spans Enterprise and
-- SME&C by design) -- this just confirms the denormalised Roles.Segment column is not NULL for
-- any of the 13 Huddle roles.
INSERT INTO @problems
SELECT N'Huddle role missing a Segment value', r.ExternalId
FROM dbo.Roles r
WHERE r.ExternalId LIKE N'ROLE-%' AND (r.Segment IS NULL OR r.Segment = N'');

-- New for V10.2.1: the ECIF attribution cleanup (script 13) should leave every one of the 6
-- affected activities with exactly one HuddleActivityAgents row.
INSERT INTO @problems
SELECT N'ECIF activity has more than one agent row after cleanup', a.ExternalId
FROM dbo.HuddleActivities a
WHERE a.ExternalId IN (N'AE-03-ECIF-01', N'CE-05-ECIF-01', N'CSA-02-ECIF-01', N'SE-01-ECIF-01',
                        N'WF-X-ORCH-01-P-ATS-ECIF02', N'WF-X-ORCH-01-P-ATS-ECIF03')
GROUP BY a.ExternalId, a.Id
HAVING (SELECT COUNT(*) FROM dbo.HuddleActivityAgents aa WHERE aa.HuddleActivityId = a.Id) <> 1;

IF EXISTS (SELECT 1 FROM @problems)
BEGIN
    SELECT [Check], [Detail] FROM @problems ORDER BY [Check], [Detail];
    THROW 51000, 'Validation found problems. The result set above lists them.', 1;
END

SELECT N'Validation passed.' AS [Status];
GO
