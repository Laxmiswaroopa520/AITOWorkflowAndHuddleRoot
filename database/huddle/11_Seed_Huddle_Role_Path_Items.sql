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
BEGIN TRY
    BEGIN TRANSACTION;
    DECLARE @SourceCount int = 0, @InsertedCount int = 0, @UpdatedCount int = 0, @SkippedCount int = 0, @DuplicateCount int = 0, @MissingRelationshipCount int = 0;
    DECLARE @Source TABLE(SegmentRoleExternalId nvarchar(100),WeekPosition int,TopicExternalId nvarchar(100)); INSERT @Source VALUES
(N'segment-role-ae-ent',1,N'WF-PIPE-01'),
(N'segment-role-ae-ent',2,N'WF-FCST-01'),
(N'segment-role-ae-ent',3,N'WF-PLAN-01'),
(N'segment-role-ae-ent',4,N'WF-OPP-01'),
(N'segment-role-ae-ent',5,N'WF-DEAL-01'),
(N'segment-role-ae-ent',6,N'WF-CONV-01'),
(N'segment-role-ae-ent',7,N'WF-RENEW-01'),
(N'segment-role-ats-ent',1,N'WF-INTEL-01'),
(N'segment-role-ats-ent',2,N'WF-NARR-01'),
(N'segment-role-ats-ent',3,N'WF-WORKLOAD-01'),
(N'segment-role-ats-ent',4,N'WF-TECH-01'),
(N'segment-role-ats-ent',5,N'WF-EBC-01'),
(N'segment-role-ats-ent',6,N'WF-TALK-01'),
(N'segment-role-ats-ent',7,N'WF-TEAM-01'),
(N'segment-role-ssp-ent',1,N'WF-LEAD-01'),
(N'segment-role-ssp-ent',2,N'WF-SOLUTION-01'),
(N'segment-role-ssp-ent',3,N'WF-VALUE-01'),
(N'segment-role-ssp-ent',4,N'WF-CONV-01'),
(N'segment-role-ssp-ent',5,N'WF-VTEAM-01'),
(N'segment-role-ssp-ent',6,N'WF-COMP-01'),
(N'segment-role-ssp-ent',7,N'WF-DEAL-01'),
(N'segment-role-se-ent',1,N'WF-SE-DISC-01'),
(N'segment-role-se-ent',2,N'WF-SE-ARCH-01'),
(N'segment-role-se-ent',3,N'WF-SE-DEMO-01'),
(N'segment-role-se-ent',4,N'WF-SE-POC-01'),
(N'segment-role-se-ent',5,N'WF-SE-QA-01'),
(N'segment-role-se-ent',6,N'WF-SE-DEAL-01'),
(N'segment-role-se-ent',7,N'WF-SE-ASSET-01'),
(N'segment-role-ce-ent',1,N'WF-CE-RISK-01'),
(N'segment-role-ce-ent',2,N'WF-CE-STRUCT-01'),
(N'segment-role-ce-ent',3,N'WF-CE-POLICY-01'),
(N'segment-role-ce-ent',4,N'WF-CE-NEG-01'),
(N'segment-role-ce-ent',5,N'WF-CE-APPROVAL-01'),
(N'segment-role-ce-ent',6,N'WF-CE-RENEW-01'),
(N'segment-role-ce-ent',7,N'WF-CE-TRANS-01'),
(N'segment-role-csa-ces',1,N'WF-HEALTH-01'),
(N'segment-role-csa-ces',2,N'WF-ARCH-01'),
(N'segment-role-csa-ces',3,N'WF-TECH-01'),
(N'segment-role-csa-ces',4,N'WF-TECH-CONV-01'),
(N'segment-role-csa-ces',5,N'WF-CONSUME-01'),
(N'segment-role-csa-ces',6,N'WF-OPT-01'),
(N'segment-role-csa-ces',7,N'WF-VALUE-TECH-01'),
(N'segment-role-csam-ces',1,N'WF-CS-HEALTH-01'),
(N'segment-role-csam-ces',2,N'WF-SUCCESS-01'),
(N'segment-role-csam-ces',3,N'WF-CS-ORCH-01'),
(N'segment-role-csam-ces',4,N'WF-ESC-01'),
(N'segment-role-csam-ces',5,N'WF-CONSUME-01'),
(N'segment-role-csam-ces',6,N'WF-ADOPT-01'),
(N'segment-role-csam-ces',7,N'WF-RENEW-01'); SELECT @SourceCount=COUNT(*) FROM @Source;
    SELECT @DuplicateCount=COUNT(*) FROM(SELECT SegmentRoleExternalId,WeekPosition FROM @Source GROUP BY SegmentRoleExternalId,WeekPosition HAVING COUNT(*)>1)d; IF @DuplicateCount>0 THROW 51002,'Duplicate role/week source positions.',1; SELECT @MissingRelationshipCount=COUNT(*) FROM @Source s LEFT JOIN dbo.HuddleSegmentRoles sr ON sr.ExternalId=s.SegmentRoleExternalId LEFT JOIN dbo.HuddleTopics t ON t.ExternalId=s.TopicExternalId WHERE sr.Id IS NULL OR t.Id IS NULL;
    
    UPDATE x SET x.HuddleTopicId=t.Id FROM dbo.HuddleRolePathItems x JOIN dbo.HuddleSegmentRoles sr ON sr.Id=x.HuddleSegmentRoleId JOIN @Source s ON s.SegmentRoleExternalId=sr.ExternalId AND s.WeekPosition=x.WeekPosition JOIN dbo.HuddleTopics t ON t.ExternalId=s.TopicExternalId; SET @UpdatedCount=@@ROWCOUNT; INSERT dbo.HuddleRolePathItems(HuddleSegmentRoleId,WeekPosition,HuddleTopicId) SELECT sr.Id,s.WeekPosition,t.Id FROM @Source s JOIN dbo.HuddleSegmentRoles sr ON sr.ExternalId=s.SegmentRoleExternalId JOIN dbo.HuddleTopics t ON t.ExternalId=s.TopicExternalId WHERE NOT EXISTS(SELECT 1 FROM dbo.HuddleRolePathItems x WHERE x.HuddleSegmentRoleId=sr.Id AND x.WeekPosition=s.WeekPosition);
    SET @InsertedCount=@@ROWCOUNT; SET @SkippedCount=@SourceCount-@InsertedCount-@UpdatedCount;
    SELECT @SourceCount AS SourceCount, @InsertedCount AS InsertedCount, @UpdatedCount AS UpdatedCount, @SkippedCount AS SkippedCount, @DuplicateCount AS DuplicateExternalIds, @MissingRelationshipCount AS MissingRelationships;
    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
    THROW;
END CATCH;
GO
