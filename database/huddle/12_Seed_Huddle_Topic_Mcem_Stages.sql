
USE [AitoWorkflowAndHuddleGeneratorDb];
GO
SET NOCOUNT ON;
SET XACT_ABORT ON;
GO
BEGIN TRY
    BEGIN TRANSACTION;
    DECLARE @SourceCount int = 0, @InsertedCount int = 0, @UpdatedCount int = 0, @SkippedCount int = 0, @DuplicateCount int = 0, @MissingRelationshipCount int = 0;
    DECLARE @Source TABLE(TopicExternalId nvarchar(100),StageExternalId nvarchar(100),DisplayOrder int); INSERT @Source VALUES
(N'WF-ADOPT-01',N'MCEM-04',1),
(N'WF-ARCH-01',N'MCEM-02',2),
(N'WF-CE-APPROVAL-01',N'MCEM-03',3),
(N'WF-CE-NEG-01',N'MCEM-03',4),
(N'WF-CE-POLICY-01',N'MCEM-03',5),
(N'WF-CE-RENEW-01',N'MCEM-04',6),
(N'WF-CE-RISK-01',N'MCEM-05',7),
(N'WF-CE-STRUCT-01',N'MCEM-03',8),
(N'WF-CE-TRANS-01',N'MCEM-03',9),
(N'WF-COMP-01',N'MCEM-02',10),
(N'WF-CONSUME-01',N'MCEM-04',11),
(N'WF-CONV-01',N'MCEM-01',12),
(N'WF-CS-HEALTH-01',N'MCEM-04',13),
(N'WF-CS-ORCH-01',N'MCEM-04',14),
(N'WF-DEAL-01',N'MCEM-03',15),
(N'WF-EBC-01',N'MCEM-02',16),
(N'WF-ESC-01',N'MCEM-04',17),
(N'WF-FCST-01',N'MCEM-05',18),
(N'WF-HEALTH-01',N'MCEM-04',19),
(N'WF-INTEL-01',N'MCEM-05',20),
(N'WF-LEAD-01',N'MCEM-05',21),
(N'WF-NARR-01',N'MCEM-02',22),
(N'WF-OPP-01',N'MCEM-01',23),
(N'WF-OPT-01',N'MCEM-02',24),
(N'WF-PIPE-01',N'MCEM-04',25),
(N'WF-PLAN-01',N'MCEM-05',26),
(N'WF-RENEW-01',N'MCEM-04',27),
(N'WF-SE-ARCH-01',N'MCEM-03',28),
(N'WF-SE-ASSET-01',N'MCEM-03',29),
(N'WF-SE-DEAL-01',N'MCEM-05',30),
(N'WF-SE-DEMO-01',N'MCEM-03',31),
(N'WF-SE-DISC-01',N'MCEM-03',32),
(N'WF-SE-POC-01',N'MCEM-03',33),
(N'WF-SE-QA-01',N'MCEM-03',34),
(N'WF-SOLUTION-01',N'MCEM-02',35),
(N'WF-SUCCESS-01',N'MCEM-04',36),
(N'WF-TALK-01',N'MCEM-02',37),
(N'WF-TEAM-01',N'MCEM-01',38),
(N'WF-TECH-01',N'MCEM-02',39),
(N'WF-TECH-CONV-01',N'MCEM-02',40),
(N'WF-VALUE-01',N'MCEM-02',41),
(N'WF-VALUE-TECH-01',N'MCEM-02',42),
(N'WF-VTEAM-01',N'MCEM-02',43),
(N'WF-WORKLOAD-01',N'MCEM-05',44); SELECT @SourceCount=COUNT(*) FROM @Source;
    SELECT @MissingRelationshipCount=COUNT(*) FROM @Source s LEFT JOIN dbo.HuddleTopics t ON t.ExternalId=s.TopicExternalId LEFT JOIN dbo.HuddleMcemStages m ON m.ExternalId=s.StageExternalId WHERE t.Id IS NULL OR m.Id IS NULL;
    
    INSERT dbo.HuddleTopicMcemStages(HuddleTopicId,HuddleMcemStageId,DisplayOrder) SELECT t.Id,m.Id,s.DisplayOrder FROM @Source s JOIN dbo.HuddleTopics t ON t.ExternalId=s.TopicExternalId JOIN dbo.HuddleMcemStages m ON m.ExternalId=s.StageExternalId WHERE NOT EXISTS(SELECT 1 FROM dbo.HuddleTopicMcemStages x WHERE x.HuddleTopicId=t.Id AND x.HuddleMcemStageId=m.Id);
    SET @InsertedCount=@@ROWCOUNT; SET @SkippedCount=@SourceCount-@InsertedCount-@UpdatedCount;
    SELECT @SourceCount AS SourceCount, @InsertedCount AS InsertedCount, @UpdatedCount AS UpdatedCount, @SkippedCount AS SkippedCount, @DuplicateCount AS DuplicateExternalIds, @MissingRelationshipCount AS MissingRelationships;
    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
    THROW;
END CATCH;
GO
