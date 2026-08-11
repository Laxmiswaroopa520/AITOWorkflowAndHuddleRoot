
USE [AitoWorkflowAndHuddleGeneratorDb];
GO
SET NOCOUNT ON;
SET XACT_ABORT ON;
GO
BEGIN TRY
    BEGIN TRANSACTION;
    DECLARE @SourceCount int = 0, @InsertedCount int = 0, @UpdatedCount int = 0, @SkippedCount int = 0, @DuplicateCount int = 0, @MissingRelationshipCount int = 0;
    DECLARE @Source TABLE(TopicExternalId nvarchar(100),AgentExternalId nvarchar(100),UsageType nvarchar(20),DisplayOrder int); INSERT @Source VALUES
(N'WF-SE-DISC-01',N'TOOL-001',N'Primary',1),
(N'WF-SE-DISC-01',N'TOOL-010',N'Secondary',2),
(N'WF-SE-ARCH-01',N'TOOL-005',N'Primary',1),
(N'WF-SE-ARCH-01',N'TOOL-001',N'Secondary',2),
(N'WF-SE-DEMO-01',N'TOOL-003',N'Primary',1),
(N'WF-SE-DEMO-01',N'TOOL-005',N'Secondary',2),
(N'WF-SE-POC-01',N'TOOL-003',N'Primary',1),
(N'WF-SE-POC-01',N'TOOL-001',N'Secondary',2),
(N'WF-SE-DEAL-01',N'TOOL-002',N'Primary',1),
(N'WF-SE-DEAL-01',N'TOOL-001',N'Secondary',2),
(N'WF-SE-ASSET-01',N'TOOL-003',N'Primary',1),
(N'WF-SE-QA-01',N'TOOL-005',N'Primary',1),
(N'WF-SE-QA-01',N'TOOL-003',N'Secondary',2),
(N'WF-CE-RISK-01',N'TOOL-008',N'Primary',1),
(N'WF-CE-RISK-01',N'TOOL-002',N'Secondary',2),
(N'WF-CE-STRUCT-01',N'TOOL-002',N'Primary',1),
(N'WF-CE-STRUCT-01',N'TOOL-001',N'Secondary',2),
(N'WF-CE-POLICY-01',N'TOOL-003',N'Primary',1),
(N'WF-CE-POLICY-01',N'TOOL-002',N'Secondary',2),
(N'WF-CE-NEG-01',N'TOOL-002',N'Primary',1),
(N'WF-CE-NEG-01',N'TOOL-010',N'Secondary',2),
(N'WF-CE-APPROVAL-01',N'TOOL-002',N'Primary',1),
(N'WF-CE-APPROVAL-01',N'TOOL-001',N'Secondary',2),
(N'WF-CE-RENEW-01',N'TOOL-002',N'Primary',1),
(N'WF-CE-RENEW-01',N'TOOL-008',N'Secondary',2),
(N'WF-CE-TRANS-01',N'TOOL-005',N'Primary',1),
(N'WF-CE-TRANS-01',N'TOOL-001',N'Secondary',2),
(N'WF-HEALTH-01',N'TOOL-001',N'Primary',1),
(N'WF-HEALTH-01',N'TOOL-008',N'Secondary',2),
(N'WF-ARCH-01',N'TOOL-005',N'Primary',1),
(N'WF-ARCH-01',N'TOOL-003',N'Secondary',2),
(N'WF-TECH-01',N'TOOL-002',N'Primary',1),
(N'WF-TECH-01',N'TOOL-003',N'Secondary',2),
(N'WF-TECH-CONV-01',N'TOOL-001',N'Primary',1),
(N'WF-TECH-CONV-01',N'TOOL-010',N'Secondary',2),
(N'WF-CONSUME-01',N'TOOL-008',N'Primary',1),
(N'WF-CONSUME-01',N'TOOL-002',N'Secondary',2),
(N'WF-OPT-01',N'TOOL-008',N'Primary',1),
(N'WF-OPT-01',N'TOOL-003',N'Secondary',2),
(N'WF-VALUE-TECH-01',N'TOOL-001',N'Primary',1),
(N'WF-VALUE-TECH-01',N'TOOL-003',N'Secondary',2),
(N'WF-PIPE-01',N'TOOL-008',N'Primary',1),
(N'WF-PIPE-01',N'TOOL-011',N'Secondary',2),
(N'WF-FCST-01',N'TOOL-008',N'Primary',1),
(N'WF-FCST-01',N'TOOL-001',N'Secondary',2),
(N'WF-PLAN-01',N'TOOL-002',N'Primary',1),
(N'WF-PLAN-01',N'TOOL-004',N'Secondary',2),
(N'WF-OPP-01',N'TOOL-002',N'Primary',1),
(N'WF-DEAL-01',N'TOOL-002',N'Primary',1),
(N'WF-RENEW-01',N'TOOL-002',N'Primary',1),
(N'WF-RENEW-01',N'TOOL-001',N'Secondary',2),
(N'WF-CONV-01',N'TOOL-002',N'Primary',1),
(N'WF-CONV-01',N'TOOL-010',N'Secondary',2),
(N'WF-INTEL-01',N'TOOL-003',N'Primary',1),
(N'WF-INTEL-01',N'TOOL-008',N'Secondary',2),
(N'WF-NARR-01',N'TOOL-002',N'Primary',1),
(N'WF-NARR-01',N'TOOL-003',N'Secondary',2),
(N'WF-WORKLOAD-01',N'TOOL-008',N'Primary',1),
(N'WF-WORKLOAD-01',N'TOOL-005',N'Secondary',2),
(N'WF-TECH-01',N'TOOL-005',N'Secondary',3),
(N'WF-EBC-01',N'TOOL-003',N'Primary',1),
(N'WF-TALK-01',N'TOOL-010',N'Primary',1),
(N'WF-TALK-01',N'TOOL-001',N'Secondary',2),
(N'WF-TEAM-01',N'TOOL-001',N'Primary',1),
(N'WF-TEAM-01',N'TOOL-002',N'Secondary',2),
(N'WF-LEAD-01',N'TOOL-003',N'Primary',1),
(N'WF-LEAD-01',N'TOOL-002',N'Secondary',2),
(N'WF-SOLUTION-01',N'TOOL-002',N'Primary',1),
(N'WF-SOLUTION-01',N'TOOL-003',N'Secondary',2),
(N'WF-VALUE-01',N'TOOL-001',N'Primary',1),
(N'WF-VALUE-01',N'TOOL-005',N'Secondary',2),
(N'WF-VTEAM-01',N'TOOL-001',N'Primary',1),
(N'WF-VTEAM-01',N'TOOL-002',N'Secondary',2),
(N'WF-COMP-01',N'TOOL-008',N'Primary',1),
(N'WF-COMP-01',N'TOOL-005',N'Secondary',2),
(N'WF-DEAL-01',N'TOOL-008',N'Secondary',2),
(N'WF-CS-HEALTH-01',N'TOOL-008',N'Primary',1),
(N'WF-SUCCESS-01',N'TOOL-001',N'Primary',1),
(N'WF-SUCCESS-01',N'TOOL-003',N'Secondary',2),
(N'WF-CS-ORCH-01',N'TOOL-003',N'Primary',1),
(N'WF-CS-ORCH-01',N'TOOL-002',N'Secondary',2),
(N'WF-ESC-01',N'TOOL-002',N'Primary',1),
(N'WF-ESC-01',N'TOOL-001',N'Secondary',2),
(N'WF-ADOPT-01',N'TOOL-005',N'Primary',1),
(N'WF-ADOPT-01',N'TOOL-008',N'Secondary',2),
(N'WF-RENEW-01',N'TOOL-010',N'Secondary',3),
(N'required-researcher',N'TOOL-005',N'Primary',1),
(N'required-researcher',N'TOOL-006',N'Secondary',2),
(N'required-researcher',N'TOOL-003',N'Secondary',3),
(N'required-sales-agent',N'TOOL-002',N'Primary',1),
(N'required-sales-agent',N'TOOL-005',N'Secondary',2),
(N'required-sales-agent',N'TOOL-003',N'Secondary',3),
(N'required-cowork',N'TOOL-003',N'Primary',1),
(N'required-scout',N'TOOL-004',N'Primary',1),
(N'required-scout',N'TOOL-003',N'Secondary',2),
(N'required-agent-j',N'TOOL-010',N'Primary',1),
(N'required-agent-j',N'TOOL-002',N'Secondary',2); SELECT @SourceCount=COUNT(*) FROM @Source;
    SELECT @MissingRelationshipCount=COUNT(*) FROM @Source s LEFT JOIN dbo.HuddleTopics t ON t.ExternalId=s.TopicExternalId LEFT JOIN dbo.HuddleAgents a ON a.ExternalId=s.AgentExternalId WHERE t.Id IS NULL OR a.Id IS NULL;
    
    UPDATE x SET x.DisplayOrder=s.DisplayOrder FROM dbo.HuddleTopicAgents x JOIN dbo.HuddleTopics t ON t.Id=x.HuddleTopicId JOIN dbo.HuddleAgents a ON a.Id=x.HuddleAgentId JOIN @Source s ON s.TopicExternalId=t.ExternalId AND s.AgentExternalId=a.ExternalId AND s.UsageType=x.UsageType; SET @UpdatedCount=@@ROWCOUNT; INSERT dbo.HuddleTopicAgents(HuddleTopicId,HuddleAgentId,UsageType,DisplayLabel,ShowAgentAccessLink,DisplayOrder) SELECT t.Id,a.Id,s.UsageType,NULL,CAST(1 AS bit),s.DisplayOrder FROM @Source s JOIN dbo.HuddleTopics t ON t.ExternalId=s.TopicExternalId JOIN dbo.HuddleAgents a ON a.ExternalId=s.AgentExternalId WHERE NOT EXISTS(SELECT 1 FROM dbo.HuddleTopicAgents x WHERE x.HuddleTopicId=t.Id AND x.HuddleAgentId=a.Id AND x.UsageType=s.UsageType);
    SET @InsertedCount=@@ROWCOUNT; SET @SkippedCount=@SourceCount-@InsertedCount-@UpdatedCount;
    SELECT @SourceCount AS SourceCount, @InsertedCount AS InsertedCount, @UpdatedCount AS UpdatedCount, @SkippedCount AS SkippedCount, @DuplicateCount AS DuplicateExternalIds, @MissingRelationshipCount AS MissingRelationships;
    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
    THROW;
END CATCH;
GO
