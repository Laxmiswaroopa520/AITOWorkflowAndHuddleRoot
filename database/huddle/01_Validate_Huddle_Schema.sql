/*
    IMPORTANT:
    Review the selected database before executing this script.
    This script was generated for manual execution in SSMS.
    It has not been executed by Codex.
*/
USE [AitoWorkflowAndHuddleGeneratorDb];
GO
SET NOCOUNT ON;
SET XACT_ABORT ON;
GO
DECLARE @Required TABLE (TableName sysname NOT NULL);
INSERT @Required VALUES (N'HuddleSegments'),(N'HuddleSegmentRoles'),(N'HuddleFocusAreas'),(N'HuddleMcemStages'),(N'HuddleAgents'),(N'HuddleResources'),(N'HuddleTopics'),(N'HuddleTopicRoles'),(N'HuddleRolePathItems'),(N'HuddleTopicMcemStages'),(N'HuddlePhases'),(N'HuddleActivities'),(N'HuddleFacilitatorGuides'),(N'HuddleTopicAgents'),(N'HuddleActivityAgents'),(N'HuddleTopicResources'),(N'HuddleActivityResources'),(N'HuddleAgentResources');
IF EXISTS (SELECT 1 FROM @Required r WHERE OBJECT_ID(N'dbo.' + r.TableName, N'U') IS NULL)
BEGIN
 SELECT r.TableName AS MissingTable FROM @Required r WHERE OBJECT_ID(N'dbo.' + r.TableName, N'U') IS NULL;
 THROW 51000, 'Part 10 Huddle schema is missing. Stop the import.', 1;
END;
SELECT N'Huddle schema validation passed.' AS Result;
GO
