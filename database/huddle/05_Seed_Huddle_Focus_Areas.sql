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
    DECLARE @Source TABLE (ExternalId nvarchar(100) NOT NULL, Name nvarchar(200) NOT NULL);
    INSERT @Source VALUES
(N'focus-commercial-strategy-and-execution',N'Commercial Strategy and Execution'),
(N'focus-cross-team-orchestration',N'Cross-Team Orchestration'),
(N'focus-customer-engagement',N'Customer Engagement'),
(N'focus-customer-success-and-value-realization',N'Customer Success and Value Realization'),
(N'focus-customer-value',N'Customer Value'),
(N'focus-deal-execution',N'Deal Execution'),
(N'focus-opportunity-development',N'Opportunity Development'),
(N'focus-pipeline-development',N'Pipeline Development'),
(N'focus-pipeline-and-forecasting',N'Pipeline and Forecasting'),
(N'focus-planning-and-prioritization',N'Planning and Prioritization'),
(N'focus-renewal-and-expansion',N'Renewal and Expansion'),
(N'focus-solution-strategy',N'Solution Strategy'),
(N'focus-technical-customer-success',N'Technical Customer Success'),
(N'focus-technical-solution-design-and-execution',N'Technical Solution Design and Execution'),
(N'focus-work-orchestration',N'Work Orchestration');
    SELECT @SourceCount=COUNT(*) FROM @Source;
    SELECT @DuplicateCount=COUNT(*) FROM (SELECT ExternalId FROM @Source GROUP BY ExternalId HAVING COUNT(*)>1) d;
    IF @DuplicateCount>0 THROW 51001, 'Duplicate source external IDs.', 1;
    SELECT @UpdatedCount=COUNT(*) FROM dbo.HuddleFocusAreas t JOIN @Source s ON s.ExternalId=t.ExternalId;
    UPDATE t SET t.Name=s.Name, t.UpdatedAtUtc=SYSUTCDATETIME() FROM dbo.HuddleFocusAreas t JOIN @Source s ON s.ExternalId=t.ExternalId;
    INSERT dbo.HuddleFocusAreas (ExternalId,Name,CreatedAtUtc,UpdatedAtUtc)
    SELECT s.ExternalId,s.Name,SYSUTCDATETIME(),NULL FROM @Source s WHERE NOT EXISTS (SELECT 1 FROM dbo.HuddleFocusAreas t WHERE t.ExternalId=s.ExternalId);
    SET @InsertedCount=@@ROWCOUNT; SET @SkippedCount=@SourceCount-@InsertedCount-@UpdatedCount;
    SELECT @SourceCount AS SourceCount, @InsertedCount AS InsertedCount, @UpdatedCount AS UpdatedCount, @SkippedCount AS SkippedCount, @DuplicateCount AS DuplicateExternalIds, @MissingRelationshipCount AS MissingRelationships;
    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
    THROW;
END CATCH;
GO
