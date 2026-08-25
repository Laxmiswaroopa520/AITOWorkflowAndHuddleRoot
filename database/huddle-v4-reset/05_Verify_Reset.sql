/*
    Step 5. Read-only confirmation that the reset did what it should before you load the new data.
*/
SET NOCOUNT ON;

DECLARE @remaining TABLE ([TableName] SYSNAME, [Rows] INT);

INSERT INTO @remaining
SELECT N'HuddleTopics', COUNT(*) FROM dbo.HuddleTopics
UNION ALL SELECT N'HuddlePlacements', COUNT(*) FROM dbo.HuddlePlacements
UNION ALL SELECT N'HuddlePhases', COUNT(*) FROM dbo.HuddlePhases
UNION ALL SELECT N'HuddleActivities', COUNT(*) FROM dbo.HuddleActivities
UNION ALL SELECT N'HuddleFacilitatorGuides', COUNT(*) FROM dbo.HuddleFacilitatorGuides
UNION ALL SELECT N'HuddleAgents', COUNT(*) FROM dbo.HuddleAgents
UNION ALL SELECT N'HuddleResources', COUNT(*) FROM dbo.HuddleResources
UNION ALL SELECT N'HuddleTopicRoles', COUNT(*) FROM dbo.HuddleTopicRoles
UNION ALL SELECT N'HuddleTopicMcemStages', COUNT(*) FROM dbo.HuddleTopicMcemStages
UNION ALL SELECT N'HuddleTopicAgents', COUNT(*) FROM dbo.HuddleTopicAgents
UNION ALL SELECT N'HuddleTopicResources', COUNT(*) FROM dbo.HuddleTopicResources
UNION ALL SELECT N'HuddleActivityAgents', COUNT(*) FROM dbo.HuddleActivityAgents
UNION ALL SELECT N'HuddleActivityResources', COUNT(*) FROM dbo.HuddleActivityResources
UNION ALL SELECT N'HuddleAgentResources', COUNT(*) FROM dbo.HuddleAgentResources
UNION ALL SELECT N'HuddleRolePathItems', COUNT(*) FROM dbo.HuddleRolePathItems;

SELECT [TableName], [Rows],
       CASE WHEN [Rows] = 0 THEN N'empty' ELSE N'STILL HAS ROWS' END AS [Result]
FROM @remaining ORDER BY [TableName];

PRINT '--- Kept on purpose ---';
SELECT N'Roles' AS [TableName], COUNT(*) AS [Rows] FROM dbo.Roles
UNION ALL SELECT N'HuddleSegments', COUNT(*) FROM dbo.HuddleSegments
UNION ALL SELECT N'HuddleSegmentRoles', COUNT(*) FROM dbo.HuddleSegmentRoles
UNION ALL SELECT N'HuddleFocusAreas', COUNT(*) FROM dbo.HuddleFocusAreas
UNION ALL SELECT N'HuddleMcemStages', COUNT(*) FROM dbo.HuddleMcemStages
UNION ALL SELECT N'UserHuddleLaunchPlans', COUNT(*) FROM dbo.UserHuddleLaunchPlans;

IF EXISTS (SELECT 1 FROM @remaining WHERE [Rows] <> 0)
    PRINT 'Some content tables still have rows. Check the result set above before loading the new data.';
ELSE
    PRINT 'Reset verified. Now run database/huddle-v4 scripts 01 through 13 in order.';
GO
