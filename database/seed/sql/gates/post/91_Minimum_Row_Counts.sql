/* =============================================================================================
   91_Minimum_Row_Counts.sql    (NEW validation gate -- read-only; not copied from Data_Scripts)

   Why this exists: Data_Scripts/08 and /20 PRINT the expected counts but never fail on a count
   that is too LOW. An empty QA table (the original incident) would pass both. This gate makes a
   short table a hard failure.

   Semantics follow the folder's own convention (expected_counts.txt, 20_Validate_Everything.sql
   header): a count HIGHER than the minimum is a pass (a database may hold extra rows); a count
   LOWER means a seed script did not finish. Minimums are the V11.78 baseline.

   When an approved content update (a new seed version) legitimately raises a table's count,
   raise the minimum here in the same pull request and update the checksum in
   seed-manifest.json. This file is a gate, not a seed script: it has no history record and runs
   on every deployment. It writes nothing.
   ============================================================================================= */

SET NOCOUNT ON;

DECLARE @Expected TABLE ([TableName] sysname NOT NULL PRIMARY KEY, [MinimumRows] int NOT NULL);
INSERT INTO @Expected ([TableName], [MinimumRows]) VALUES
    (N'Roles', 22),
    (N'AiTools', 14),
    (N'WorkflowBuckets', 9),
    (N'Activities', 186),
    (N'ActivityAiTools', 215),
    (N'HuddleSegments', 2),
    (N'HuddleSegmentRoles', 15),
    (N'HuddleFocusAreas', 8),
    (N'HuddleMcemStages', 5),
    (N'HuddleTopics', 27),
    (N'HuddleTopicRoles', 170),
    (N'HuddlePlacements', 138),
    (N'HuddleRolePathItems', 100),
    (N'HuddlePhases', 414),
    (N'HuddleFacilitatorGuides', 138),
    (N'HuddleAgents', 22),
    (N'HuddleResources', 54),
    (N'HuddleActivities', 506),
    (N'HuddleTopicMcemStages', 23),
    (N'HuddleTopicAgents', 130),
    (N'HuddleTopicResources', 21),
    (N'HuddleActivityAgents', 648),
    (N'HuddleActivityResources', 154),
    (N'HuddleAgentResources', 28);

DECLARE @Actual TABLE ([TableName] sysname NOT NULL PRIMARY KEY, [ActualRows] int NOT NULL);
INSERT INTO @Actual ([TableName], [ActualRows]) VALUES
    (N'Roles',                    (SELECT COUNT(*) FROM dbo.Roles)),
    (N'AiTools',                  (SELECT COUNT(*) FROM dbo.AiTools)),
    (N'WorkflowBuckets',          (SELECT COUNT(*) FROM dbo.WorkflowBuckets)),
    (N'Activities',               (SELECT COUNT(*) FROM dbo.Activities)),
    (N'ActivityAiTools',          (SELECT COUNT(*) FROM dbo.ActivityAiTools)),
    (N'HuddleSegments',           (SELECT COUNT(*) FROM dbo.HuddleSegments)),
    (N'HuddleSegmentRoles',       (SELECT COUNT(*) FROM dbo.HuddleSegmentRoles)),
    (N'HuddleFocusAreas',         (SELECT COUNT(*) FROM dbo.HuddleFocusAreas)),
    (N'HuddleMcemStages',         (SELECT COUNT(*) FROM dbo.HuddleMcemStages)),
    (N'HuddleTopics',             (SELECT COUNT(*) FROM dbo.HuddleTopics)),
    (N'HuddleTopicRoles',         (SELECT COUNT(*) FROM dbo.HuddleTopicRoles)),
    (N'HuddlePlacements',         (SELECT COUNT(*) FROM dbo.HuddlePlacements)),
    (N'HuddleRolePathItems',      (SELECT COUNT(*) FROM dbo.HuddleRolePathItems)),
    (N'HuddlePhases',             (SELECT COUNT(*) FROM dbo.HuddlePhases)),
    (N'HuddleFacilitatorGuides',  (SELECT COUNT(*) FROM dbo.HuddleFacilitatorGuides)),
    (N'HuddleAgents',             (SELECT COUNT(*) FROM dbo.HuddleAgents)),
    (N'HuddleResources',          (SELECT COUNT(*) FROM dbo.HuddleResources)),
    (N'HuddleActivities',         (SELECT COUNT(*) FROM dbo.HuddleActivities)),
    (N'HuddleTopicMcemStages',    (SELECT COUNT(*) FROM dbo.HuddleTopicMcemStages)),
    (N'HuddleTopicAgents',        (SELECT COUNT(*) FROM dbo.HuddleTopicAgents)),
    (N'HuddleTopicResources',     (SELECT COUNT(*) FROM dbo.HuddleTopicResources)),
    (N'HuddleActivityAgents',     (SELECT COUNT(*) FROM dbo.HuddleActivityAgents)),
    (N'HuddleActivityResources',  (SELECT COUNT(*) FROM dbo.HuddleActivityResources)),
    (N'HuddleAgentResources',     (SELECT COUNT(*) FROM dbo.HuddleAgentResources));

SELECT e.[TableName],
       e.[MinimumRows],
       a.[ActualRows],
       CASE WHEN a.[ActualRows] >= e.[MinimumRows] THEN N'OK' ELSE N'TOO FEW ROWS' END AS [Result]
FROM @Expected e
JOIN @Actual a ON a.[TableName] = e.[TableName]
ORDER BY e.[TableName];

IF EXISTS (SELECT 1 FROM @Expected e JOIN @Actual a ON a.[TableName] = e.[TableName]
           WHERE a.[ActualRows] < e.[MinimumRows])
    THROW 52001, 'One or more seeded tables hold fewer rows than the approved minimum. See the [Result] column above.', 1;

PRINT 'OK: every seeded table holds at least its approved minimum row count.';
GO
