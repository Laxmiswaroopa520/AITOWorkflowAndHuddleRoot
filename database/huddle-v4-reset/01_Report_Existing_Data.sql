/*
    Step 1. Read-only inventory. Nothing is changed here.
    Run this first so you know exactly what the delete scripts will remove, and keep the output.
*/
SET NOCOUNT ON;

PRINT '--- Huddle content tables ---';
SELECT t.[name] AS [TableName], SUM(p.[rows]) AS [Rows]
FROM sys.tables t
INNER JOIN sys.partitions p ON p.object_id = t.object_id AND p.index_id IN (0, 1)
WHERE t.[name] IN (
    N'HuddleTopics', N'HuddlePlacements', N'HuddlePhases', N'HuddleActivities',
    N'HuddleFacilitatorGuides', N'HuddleAgents', N'HuddleResources',
    N'HuddleTopicRoles', N'HuddleTopicMcemStages', N'HuddleTopicAgents', N'HuddleTopicResources',
    N'HuddleActivityAgents', N'HuddleActivityResources', N'HuddleAgentResources',
    N'HuddleRolePathItems')
GROUP BY t.[name]
ORDER BY t.[name];

PRINT '--- Reference tables (kept by default) ---';
SELECT t.[name] AS [TableName], SUM(p.[rows]) AS [Rows]
FROM sys.tables t
INNER JOIN sys.partitions p ON p.object_id = t.object_id AND p.index_id IN (0, 1)
WHERE t.[name] IN (N'Roles', N'HuddleSegments', N'HuddleSegmentRoles', N'HuddleFocusAreas', N'HuddleMcemStages')
GROUP BY t.[name]
ORDER BY t.[name];

PRINT '--- User data that BLOCKS the content delete ---';
-- Every one of these foreign keys is Restrict, so the content delete fails while any of them exist.
SELECT N'UserHuddleSessions' AS [TableName], COUNT(*) AS [Rows] FROM dbo.UserHuddleSessions
UNION ALL SELECT N'UserHuddleActivityProgress', COUNT(*) FROM dbo.UserHuddleActivityProgress
UNION ALL SELECT N'UserHuddlePlans', COUNT(*) FROM dbo.UserHuddlePlans
UNION ALL SELECT N'UserHuddlePlanItems', COUNT(*) FROM dbo.UserHuddlePlanItems
UNION ALL SELECT N'HuddleVotes', COUNT(*) FROM dbo.HuddleVotes
UNION ALL SELECT N'UserHuddleLaunchPlans (no catalogue FK, kept)', COUNT(*) FROM dbo.UserHuddleLaunchPlans;

PRINT '--- Existing topics, so you can see what is about to go ---';
SELECT ExternalId, [Name], PublicationStatus, CreatedAtUtc FROM dbo.HuddleTopics ORDER BY ExternalId;

PRINT '--- Existing agents and resources ---';
SELECT ExternalId, [Name] FROM dbo.HuddleAgents ORDER BY ExternalId;
SELECT ExternalId, Title FROM dbo.HuddleResources ORDER BY ExternalId;
GO
