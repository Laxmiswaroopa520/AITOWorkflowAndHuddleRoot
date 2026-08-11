
USE [AitoWorkflowAndHuddleGeneratorDb];
GO
SET NOCOUNT ON;
SET XACT_ABORT ON;
GO
BEGIN TRY
    BEGIN TRANSACTION;
    DECLARE @SourceCount int = 0, @InsertedCount int = 0, @UpdatedCount int = 0, @SkippedCount int = 0, @DuplicateCount int = 0, @MissingRelationshipCount int = 0;
    DECLARE @Source TABLE(TopicExternalId nvarchar(100),ResourceExternalId nvarchar(100),DisplayOrder int); INSERT @Source VALUES
(N'WF-ADOPT-01',N'RES-007',1),
(N'WF-ADOPT-01',N'RES-006',2),
(N'WF-ARCH-01',N'RES-007',1),
(N'WF-ARCH-01',N'RES-003',2),
(N'WF-CE-APPROVAL-01',N'RES-001',1),
(N'WF-CE-NEG-01',N'RES-001',1),
(N'WF-CE-POLICY-01',N'RES-003',1),
(N'WF-CE-POLICY-01',N'RES-001',2),
(N'WF-CE-RENEW-01',N'RES-001',1),
(N'WF-CE-RENEW-01',N'RES-006',2),
(N'WF-CE-RISK-01',N'RES-006',1),
(N'WF-CE-RISK-01',N'RES-001',2),
(N'WF-CE-STRUCT-01',N'RES-001',1),
(N'WF-CE-TRANS-01',N'RES-007',1),
(N'WF-COMP-01',N'RES-006',1),
(N'WF-COMP-01',N'RES-007',2),
(N'WF-CONSUME-01',N'RES-006',1),
(N'WF-CONSUME-01',N'RES-001',2),
(N'WF-CONV-01',N'RES-001',1),
(N'WF-CS-HEALTH-01',N'RES-006',1),
(N'WF-CS-ORCH-01',N'RES-003',1),
(N'WF-CS-ORCH-01',N'RES-001',2),
(N'WF-DEAL-01',N'RES-001',1),
(N'WF-DEAL-01',N'RES-006',2),
(N'WF-EBC-01',N'RES-003',1),
(N'WF-ESC-01',N'RES-001',1),
(N'WF-FCST-01',N'RES-006',1),
(N'WF-HEALTH-01',N'RES-006',1),
(N'WF-INTEL-01',N'RES-003',1),
(N'WF-INTEL-01',N'RES-006',2),
(N'WF-LEAD-01',N'RES-003',1),
(N'WF-LEAD-01',N'RES-001',2),
(N'WF-NARR-01',N'RES-001',1),
(N'WF-NARR-01',N'RES-003',2),
(N'WF-OPP-01',N'RES-001',1),
(N'WF-OPT-01',N'RES-006',1),
(N'WF-OPT-01',N'RES-003',2),
(N'WF-PIPE-01',N'RES-006',1),
(N'WF-PIPE-01',N'RES-001',2),
(N'WF-PLAN-01',N'RES-001',1),
(N'WF-PLAN-01',N'RES-004',2),
(N'WF-RENEW-01',N'RES-001',1),
(N'WF-SE-ARCH-01',N'RES-007',1),
(N'WF-SE-ASSET-01',N'RES-003',1),
(N'WF-SE-DEAL-01',N'RES-001',1),
(N'WF-SE-DEMO-01',N'RES-003',1),
(N'WF-SE-DEMO-01',N'RES-007',2),
(N'WF-SE-POC-01',N'RES-003',1),
(N'WF-SE-QA-01',N'RES-007',1),
(N'WF-SE-QA-01',N'RES-003',2),
(N'WF-SOLUTION-01',N'RES-001',1),
(N'WF-SOLUTION-01',N'RES-003',2),
(N'WF-SUCCESS-01',N'RES-003',1),
(N'WF-TEAM-01',N'RES-001',1),
(N'WF-TECH-01',N'RES-001',1),
(N'WF-TECH-01',N'RES-003',2),
(N'WF-TECH-01',N'RES-007',3),
(N'WF-VALUE-01',N'RES-007',1),
(N'WF-VALUE-TECH-01',N'RES-003',1),
(N'WF-VTEAM-01',N'RES-001',1),
(N'WF-WORKLOAD-01',N'RES-006',1),
(N'WF-WORKLOAD-01',N'RES-007',2); SELECT @SourceCount=COUNT(*) FROM @Source;
    SELECT @MissingRelationshipCount=COUNT(*) FROM @Source s LEFT JOIN dbo.HuddleTopics t ON t.ExternalId=s.TopicExternalId LEFT JOIN dbo.HuddleResources r ON r.ExternalId=s.ResourceExternalId WHERE t.Id IS NULL OR r.Id IS NULL;
    
    INSERT dbo.HuddleTopicResources(HuddleTopicId,HuddleResourceId,DisplayOrder) SELECT t.Id,r.Id,s.DisplayOrder FROM @Source s JOIN dbo.HuddleTopics t ON t.ExternalId=s.TopicExternalId JOIN dbo.HuddleResources r ON r.ExternalId=s.ResourceExternalId WHERE NOT EXISTS(SELECT 1 FROM dbo.HuddleTopicResources x WHERE x.HuddleTopicId=t.Id AND x.HuddleResourceId=r.Id);
    SET @InsertedCount=@@ROWCOUNT; SET @SkippedCount=@SourceCount-@InsertedCount-@UpdatedCount;
    SELECT @SourceCount AS SourceCount, @InsertedCount AS InsertedCount, @UpdatedCount AS UpdatedCount, @SkippedCount AS SkippedCount, @DuplicateCount AS DuplicateExternalIds, @MissingRelationshipCount AS MissingRelationships;
    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
    THROW;
END CATCH;
GO
