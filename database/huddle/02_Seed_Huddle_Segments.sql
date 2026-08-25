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
(N'segment-ceands',N'CE&S'),
(N'segment-enterprise',N'Enterprise');
    SELECT @SourceCount=COUNT(*) FROM @Source;
    SELECT @DuplicateCount=COUNT(*) FROM (SELECT ExternalId FROM @Source GROUP BY ExternalId HAVING COUNT(*)>1) d;
    IF @DuplicateCount>0 THROW 51001, 'Duplicate source external IDs.', 1;
    SELECT @UpdatedCount=COUNT(*) FROM dbo.HuddleSegments t JOIN @Source s ON s.ExternalId=t.ExternalId;
    UPDATE t SET t.Name=s.Name, t.UpdatedAtUtc=SYSUTCDATETIME() FROM dbo.HuddleSegments t JOIN @Source s ON s.ExternalId=t.ExternalId;
    INSERT dbo.HuddleSegments (ExternalId,Name,CreatedAtUtc,UpdatedAtUtc)
    SELECT s.ExternalId,s.Name,SYSUTCDATETIME(),NULL FROM @Source s WHERE NOT EXISTS (SELECT 1 FROM dbo.HuddleSegments t WHERE t.ExternalId=s.ExternalId);
    SET @InsertedCount=@@ROWCOUNT; SET @SkippedCount=@SourceCount-@InsertedCount-@UpdatedCount;
    SELECT @SourceCount AS SourceCount, @InsertedCount AS InsertedCount, @UpdatedCount AS UpdatedCount, @SkippedCount AS SkippedCount, @DuplicateCount AS DuplicateExternalIds, @MissingRelationshipCount AS MissingRelationships;
    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
    THROW;
END CATCH;
GO
