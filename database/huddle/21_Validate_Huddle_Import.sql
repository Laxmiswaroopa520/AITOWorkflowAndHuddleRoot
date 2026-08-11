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
DECLARE @Expected TABLE(TableName sysname,ExpectedSourceCount int);
+INSERT @Expected VALUES (N'HuddleSegments',2),(N'HuddleSegmentRoles',7),(N'HuddleFocusAreas',15),(N'HuddleMcemStages',5),(N'HuddleAgents',11),(N'HuddleResources',8),(N'HuddleTopics',49),(N'HuddlePhases',132),(N'HuddleActivities',97);
+SELECT e.TableName,e.ExpectedSourceCount,CASE e.TableName WHEN N'HuddleSegments' THEN (SELECT COUNT(*) FROM dbo.HuddleSegments) WHEN N'HuddleSegmentRoles' THEN (SELECT COUNT(*) FROM dbo.HuddleSegmentRoles) WHEN N'HuddleFocusAreas' THEN (SELECT COUNT(*) FROM dbo.HuddleFocusAreas) WHEN N'HuddleMcemStages' THEN (SELECT COUNT(*) FROM dbo.HuddleMcemStages) WHEN N'HuddleAgents' THEN (SELECT COUNT(*) FROM dbo.HuddleAgents) WHEN N'HuddleResources' THEN (SELECT COUNT(*) FROM dbo.HuddleResources) WHEN N'HuddleTopics' THEN (SELECT COUNT(*) FROM dbo.HuddleTopics) WHEN N'HuddlePhases' THEN (SELECT COUNT(*) FROM dbo.HuddlePhases) WHEN N'HuddleActivities' THEN (SELECT COUNT(*) FROM dbo.HuddleActivities) END ActualDatabaseCount FROM @Expected e ORDER BY e.TableName;
+SELECT N'DuplicateExternalId' Issue,N'HuddleTopics' Entity,ExternalId,COUNT(*) DuplicateCount FROM dbo.HuddleTopics GROUP BY ExternalId HAVING COUNT(*)>1 UNION ALL SELECT N'DuplicateExternalId',N'HuddlePhases',ExternalId,COUNT(*) FROM dbo.HuddlePhases GROUP BY ExternalId HAVING COUNT(*)>1 UNION ALL SELECT N'DuplicateExternalId',N'HuddleActivities',ExternalId,COUNT(*) FROM dbo.HuddleActivities GROUP BY ExternalId HAVING COUNT(*)>1 UNION ALL SELECT N'DuplicateExternalId',N'HuddleAgents',ExternalId,COUNT(*) FROM dbo.HuddleAgents GROUP BY ExternalId HAVING COUNT(*)>1 UNION ALL SELECT N'DuplicateExternalId',N'HuddleResources',ExternalId,COUNT(*) FROM dbo.HuddleResources GROUP BY ExternalId HAVING COUNT(*)>1;
+SELECT N'TopicsWithoutRoles' Issue,t.ExternalId FROM dbo.HuddleTopics t WHERE NOT EXISTS(SELECT 1 FROM dbo.HuddleTopicRoles r WHERE r.HuddleTopicId=t.Id);
+SELECT N'TopicsWithoutPhases' Issue,t.ExternalId FROM dbo.HuddleTopics t WHERE NOT EXISTS(SELECT 1 FROM dbo.HuddlePhases p WHERE p.HuddleTopicId=t.Id);
+SELECT N'TopicsWithoutActivities' Issue,t.ExternalId FROM dbo.HuddleTopics t WHERE NOT EXISTS(SELECT 1 FROM dbo.HuddleActivities a WHERE a.HuddleTopicId=t.Id);
+SELECT N'ActivitiesWithoutTopicOrPhase' Issue,a.ExternalId FROM dbo.HuddleActivities a LEFT JOIN dbo.HuddleTopics t ON t.Id=a.HuddleTopicId LEFT JOIN dbo.HuddlePhases p ON p.Id=a.HuddlePhaseId WHERE t.Id IS NULL OR p.Id IS NULL;
+SELECT N'TopicsWithoutPrimaryAgent' Issue,t.ExternalId FROM dbo.HuddleTopics t WHERE NOT EXISTS(SELECT 1 FROM dbo.HuddleTopicAgents a WHERE a.HuddleTopicId=t.Id AND a.UsageType=N'Primary');
+SELECT N'TopicsWithoutFocusArea' Issue,t.ExternalId FROM dbo.HuddleTopics t WHERE t.Type<>N'Foundation' AND t.HuddleFocusAreaId IS NULL;
+SELECT N'TopicsWithoutMcemStage' Issue,t.ExternalId FROM dbo.HuddleTopics t WHERE NOT EXISTS(SELECT 1 FROM dbo.HuddleTopicMcemStages m WHERE m.HuddleTopicId=t.Id);
+SELECT N'InvalidResourceUrl' Issue,r.ExternalId,r.Url FROM dbo.HuddleResources r WHERE r.Url IS NOT NULL AND r.Url NOT LIKE N'https://%' AND r.Url NOT LIKE N'http://%';
+SELECT N'InvalidAgentUrl' Issue,a.ExternalId,a.AccessUrl FROM dbo.HuddleAgents a WHERE a.AccessUrl IS NOT NULL AND a.AccessUrl NOT LIKE N'https://%' AND a.AccessUrl NOT LIKE N'http://%';
+SELECT N'MissingSemanticFields' Issue,t.ExternalId,t.TodayObjective,t.UseCase,t.WhyItMatters,t.DesiredOutcome,t.ReflectionPrompt,t.CommitmentPrompt,t.KeyTakeaway FROM dbo.HuddleTopics t WHERE t.TodayObjective IS NULL OR t.UseCase IS NULL OR t.WhyItMatters IS NULL OR t.DesiredOutcome IS NULL OR t.ReflectionPrompt IS NULL OR t.CommitmentPrompt IS NULL OR t.KeyTakeaway IS NULL;
+SELECT N'ActivitiesMissingFutureSemanticFields' Issue,a.ExternalId,a.BestFitJob,a.RequiredContext FROM dbo.HuddleActivities a WHERE a.BestFitJob IS NULL OR a.RequiredContext IS NULL;
+SELECT N'InvalidTopicDuration' Issue,t.ExternalId FROM dbo.HuddleTopics t WHERE t.DurationMinutes IS NOT NULL AND t.DurationMinutes<=0;
+SELECT N'InvalidPhaseDuration' Issue,p.ExternalId FROM dbo.HuddlePhases p WHERE p.DurationMinutes IS NOT NULL AND p.DurationMinutes<=0;
+SELECT N'InvalidActivityDuration' Issue,a.ExternalId FROM dbo.HuddleActivities a WHERE a.DurationMinutes IS NOT NULL AND a.DurationMinutes<=0;
+SELECT N'InvalidVoteValue' Issue,CONVERT(nvarchar(36),v.Id) ExternalId FROM dbo.HuddleVotes v WHERE v.Value NOT IN(-1,1);
+SELECT N'DuplicatePhaseOrder' Issue,t.ExternalId,p.DisplayOrder,COUNT(*) DuplicateCount FROM dbo.HuddlePhases p JOIN dbo.HuddleTopics t ON t.Id=p.HuddleTopicId GROUP BY t.ExternalId,p.DisplayOrder HAVING COUNT(*)>1;
+SELECT N'DuplicateActivityOrder' Issue,p.ExternalId,a.DisplayOrder,COUNT(*) DuplicateCount FROM dbo.HuddleActivities a JOIN dbo.HuddlePhases p ON p.Id=a.HuddlePhaseId GROUP BY p.ExternalId,a.DisplayOrder HAVING COUNT(*)>1;
+SELECT N'DuplicatePathWeek' Issue,sr.ExternalId,x.WeekPosition,COUNT(*) DuplicateCount FROM dbo.HuddleRolePathItems x JOIN dbo.HuddleSegmentRoles sr ON sr.Id=x.HuddleSegmentRoleId GROUP BY sr.ExternalId,x.WeekPosition HAVING COUNT(*)>1;
+SELECT N'UnpublishedOrIncomplete' Issue,t.ExternalId,t.PublicationStatus FROM dbo.HuddleTopics t WHERE t.PublicationStatus<>N'Published' OR t.TodayObjective IS NULL OR t.DesiredOutcome IS NULL;
+SELECT N'TemporaryZipContent' Classification,t.ExternalId,N'Client semantic fields intentionally remain NULL; replace by ExternalId when approved workbook content arrives.' Notes FROM dbo.HuddleTopics t WHERE t.PublicationStatus=N'WorkingDraft';
+GO
