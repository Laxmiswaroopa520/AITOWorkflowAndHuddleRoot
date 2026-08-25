/*
    Validation. Run last. Read-only: it reports and it raises, it never writes.
*/
SET NOCOUNT ON;

PRINT '--- Row counts: workbook versus database ---';

DECLARE @expected TABLE ([TableName] SYSNAME, [Expected] INT);
INSERT INTO @expected ([TableName], [Expected]) VALUES
    (N'HuddleActivities', 281),
    (N'HuddleActivityAgents', 317),
    (N'HuddleActivityResources', 152),
    (N'HuddleAgentResources', 22),
    (N'HuddleAgents', 18),
    (N'HuddleFacilitatorGuides', 70),
    (N'HuddleFocusAreas', 8),
    (N'HuddleMcemStages', 5),
    (N'HuddlePhases', 210),
    (N'HuddlePlacements', 70),
    (N'HuddleResources', 49),
    (N'HuddleSegmentRoles', 8),
    (N'HuddleSegments', 1),
    (N'HuddleTopicAgents', 63),
    (N'HuddleTopicMcemStages', 23),
    (N'HuddleTopicResources', 19),
    (N'HuddleTopics', 16),
    (N'Roles', 8)
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
-- Actual can exceed Expected where pre-V4 rows remain. Roles reads 9 against an expected 8:
-- your eight existing roles plus ROLE-ALL, which the workbook adds.

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

INSERT INTO @problems
SELECT N'Duplicate role abbreviation', r.Abbreviation
FROM dbo.Roles r GROUP BY r.Abbreviation HAVING COUNT(*) > 1;

IF EXISTS (SELECT 1 FROM @problems)
BEGIN
    SELECT [Check], [Detail] FROM @problems ORDER BY [Check], [Detail];
    THROW 51000, 'Validation found problems. The result set above lists them.', 1;
END

SELECT N'Validation passed.' AS [Status];
GO
