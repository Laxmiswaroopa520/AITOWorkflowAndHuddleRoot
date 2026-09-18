/*
006 - Verify reference data and relationships
Expected source counts:
Roles: 8
AI Tools: 14
Workflow Buckets: 9
Activities: 186 (one exact duplicate SharePoint row was ignored)
Activity-AI Tool mappings: 215
*/
-- No USE statement here on purpose: this folder does not assume a database name.
-- Make sure your own target database is selected in SSMS before running this script.
GO
SET NOCOUNT ON;

SELECT 'Roles' AS Entity, COUNT(*) AS ActualCount, 8 AS ExpectedMinimum FROM dbo.Roles;
SELECT 'AiTools' AS Entity, COUNT(*) AS ActualCount, 14 AS ExpectedMinimum FROM dbo.AiTools;
SELECT 'WorkflowBuckets' AS Entity, COUNT(*) AS ActualCount, 9 AS ExpectedMinimum FROM dbo.WorkflowBuckets;
SELECT 'Activities' AS Entity, COUNT(*) AS ActualCount, 186 AS ExpectedMinimum FROM dbo.Activities;
SELECT 'ActivityAiTools' AS Entity, COUNT(*) AS ActualCount, 215 AS ExpectedMinimum FROM dbo.ActivityAiTools;

SELECT a.ExternalId, a.Title
FROM dbo.Activities a
LEFT JOIN dbo.Roles r ON r.Id=a.RoleId
LEFT JOIN dbo.WorkflowBuckets b ON b.Id=a.WorkflowBucketId
WHERE r.Id IS NULL OR b.Id IS NULL;

SELECT a.ExternalId, a.Title
FROM dbo.Activities a
WHERE NOT EXISTS (SELECT 1 FROM dbo.ActivityAiTools m WHERE m.ActivityId=a.Id);

SELECT a.ExternalId, COUNT(*) AS PrimaryToolCount
FROM dbo.Activities a
LEFT JOIN dbo.ActivityAiTools m ON m.ActivityId=a.Id AND m.IsPrimary=1
GROUP BY a.ExternalId
HAVING COUNT(m.AiToolId) <> 1;

SELECT Category, COUNT(*) AS [Count] FROM dbo.Activities GROUP BY Category ORDER BY Category;
SELECT Frequency, COUNT(*) AS [Count] FROM dbo.Activities GROUP BY Frequency ORDER BY Frequency;
SELECT TriggerContext, COUNT(*) AS [Count] FROM dbo.Activities GROUP BY TriggerContext ORDER BY TriggerContext;
SELECT Priority, COUNT(*) AS [Count] FROM dbo.Activities GROUP BY Priority ORDER BY Priority;
SELECT ToolCoverageLevel, COUNT(*) AS [Count] FROM dbo.Activities GROUP BY ToolCoverageLevel ORDER BY ToolCoverageLevel;
GO
