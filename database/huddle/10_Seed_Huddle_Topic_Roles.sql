
USE [AitoWorkflowAndHuddleGeneratorDb];
GO
SET NOCOUNT ON;
SET XACT_ABORT ON;
GO
BEGIN TRY
    BEGIN TRANSACTION;
    DECLARE @SourceCount int = 0, @InsertedCount int = 0, @UpdatedCount int = 0, @SkippedCount int = 0, @DuplicateCount int = 0, @MissingRelationshipCount int = 0;
    DECLARE @Source TABLE(TopicExternalId nvarchar(100),RoleExternalId nvarchar(50)); INSERT @Source VALUES
(N'WF-ADOPT-01',N'csam-ces'),
(N'WF-ARCH-01',N'csa-ces'),
(N'WF-CE-APPROVAL-01',N'ce-ent'),
(N'WF-CE-NEG-01',N'ce-ent'),
(N'WF-CE-POLICY-01',N'ce-ent'),
(N'WF-CE-RENEW-01',N'ce-ent'),
(N'WF-CE-RISK-01',N'ce-ent'),
(N'WF-CE-STRUCT-01',N'ce-ent'),
(N'WF-CE-TRANS-01',N'ce-ent'),
(N'WF-COMP-01',N'ssp-ent'),
(N'WF-CONSUME-01',N'csa-ces'),
(N'WF-CONSUME-01',N'csam-ces'),
(N'WF-CONV-01',N'ae-ent'),
(N'WF-CONV-01',N'ssp-ent'),
(N'WF-CS-HEALTH-01',N'csam-ces'),
(N'WF-CS-ORCH-01',N'csam-ces'),
(N'WF-DEAL-01',N'ae-ent'),
(N'WF-DEAL-01',N'ssp-ent'),
(N'WF-EBC-01',N'ats-ent'),
(N'WF-ESC-01',N'csam-ces'),
(N'WF-FCST-01',N'ae-ent'),
(N'WF-HEALTH-01',N'csa-ces'),
(N'WF-INTEL-01',N'ats-ent'),
(N'WF-LEAD-01',N'ssp-ent'),
(N'WF-NARR-01',N'ats-ent'),
(N'WF-OPP-01',N'ae-ent'),
(N'WF-OPT-01',N'csa-ces'),
(N'WF-PIPE-01',N'ae-ent'),
(N'WF-PLAN-01',N'ae-ent'),
(N'WF-RENEW-01',N'ae-ent'),
(N'WF-RENEW-01',N'csam-ces'),
(N'WF-SE-ARCH-01',N'se-ent'),
(N'WF-SE-ASSET-01',N'se-ent'),
(N'WF-SE-DEAL-01',N'se-ent'),
(N'WF-SE-DEMO-01',N'se-ent'),
(N'WF-SE-DISC-01',N'se-ent'),
(N'WF-SE-POC-01',N'se-ent'),
(N'WF-SE-QA-01',N'se-ent'),
(N'WF-SOLUTION-01',N'ssp-ent'),
(N'WF-SUCCESS-01',N'csam-ces'),
(N'WF-TALK-01',N'ats-ent'),
(N'WF-TEAM-01',N'ats-ent'),
(N'WF-TECH-01',N'ats-ent'),
(N'WF-TECH-01',N'csa-ces'),
(N'WF-TECH-CONV-01',N'csa-ces'),
(N'WF-VALUE-01',N'ssp-ent'),
(N'WF-VALUE-TECH-01',N'csa-ces'),
(N'WF-VTEAM-01',N'ssp-ent'),
(N'WF-WORKLOAD-01',N'ats-ent'),
(N'required-researcher',N'all'),
(N'required-sales-agent',N'all'),
(N'required-cowork',N'all'),
(N'required-scout',N'all'),
(N'required-agent-j',N'all'); SELECT @SourceCount=COUNT(*) FROM @Source;
    SELECT @MissingRelationshipCount=COUNT(*) FROM @Source s LEFT JOIN dbo.HuddleTopics t ON t.ExternalId=s.TopicExternalId LEFT JOIN dbo.Roles r ON r.ExternalId=s.RoleExternalId WHERE t.Id IS NULL OR r.Id IS NULL;
    
    INSERT dbo.HuddleTopicRoles(HuddleTopicId,RoleId) SELECT t.Id,r.Id FROM @Source s JOIN dbo.HuddleTopics t ON t.ExternalId=s.TopicExternalId JOIN dbo.Roles r ON r.ExternalId=s.RoleExternalId WHERE NOT EXISTS(SELECT 1 FROM dbo.HuddleTopicRoles x WHERE x.HuddleTopicId=t.Id AND x.RoleId=r.Id);
    SET @InsertedCount=@@ROWCOUNT; SET @SkippedCount=@SourceCount-@InsertedCount-@UpdatedCount;
    SELECT @SourceCount AS SourceCount, @InsertedCount AS InsertedCount, @UpdatedCount AS UpdatedCount, @SkippedCount AS SkippedCount, @DuplicateCount AS DuplicateExternalIds, @MissingRelationshipCount AS MissingRelationships;
    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
    THROW;
END CATCH;
GO
