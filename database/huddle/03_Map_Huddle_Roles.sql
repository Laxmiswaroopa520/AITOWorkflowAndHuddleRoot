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
    DECLARE @Source TABLE (ExternalId nvarchar(50) NOT NULL);
    INSERT @Source VALUES
(N'ae-ent'),
(N'ats-ent'),
(N'ce-ent'),
(N'csa-ces'),
(N'csam-ces'),
(N'se-ent'),
(N'ssp-ent');
    SELECT @SourceCount=COUNT(*) FROM @Source;
    SELECT @DuplicateCount=COUNT(*) FROM (SELECT ExternalId FROM @Source GROUP BY ExternalId HAVING COUNT(*)>1) d;
    SELECT @MissingRelationshipCount=COUNT(*) FROM @Source s WHERE NOT EXISTS (SELECT 1 FROM dbo.Roles r WHERE r.ExternalId=s.ExternalId);
    SET @SkippedCount=@MissingRelationshipCount;
    SELECT s.ExternalId AS MissingRoleExternalId FROM @Source s WHERE NOT EXISTS (SELECT 1 FROM dbo.Roles r WHERE r.ExternalId=s.ExternalId);
    SELECT @SourceCount AS SourceCount, @InsertedCount AS InsertedCount, @UpdatedCount AS UpdatedCount, @SkippedCount AS SkippedCount, @DuplicateCount AS DuplicateExternalIds, @MissingRelationshipCount AS MissingRelationships;
    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
    THROW;
END CATCH;
GO
