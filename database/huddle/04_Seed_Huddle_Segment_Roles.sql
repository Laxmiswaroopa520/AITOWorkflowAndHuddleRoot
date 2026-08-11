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
    DECLARE @Source TABLE (ExternalId nvarchar(100), SegmentExternalId nvarchar(100), RoleExternalId nvarchar(50), DisplayName nvarchar(200));
    INSERT @Source VALUES
(N'segment-role-ae-ent',N'segment-enterprise',N'ae-ent',N'AE (Enterprise)'),
(N'segment-role-ats-ent',N'segment-enterprise',N'ats-ent',N'ATS (Enterprise)'),
(N'segment-role-ce-ent',N'segment-enterprise',N'ce-ent',N'CE (Enterprise)'),
(N'segment-role-csa-ces',N'segment-ceands',N'csa-ces',N'CSA (CE&S)'),
(N'segment-role-csam-ces',N'segment-ceands',N'csam-ces',N'CSAM (CE&S)'),
(N'segment-role-se-ent',N'segment-enterprise',N'se-ent',N'SE (Enterprise)'),
(N'segment-role-ssp-ent',N'segment-enterprise',N'ssp-ent',N'SSP (Enterprise)'); SELECT @SourceCount=COUNT(*) FROM @Source;
    SELECT @MissingRelationshipCount=COUNT(*) FROM @Source s LEFT JOIN dbo.HuddleSegments hs ON hs.ExternalId=s.SegmentExternalId LEFT JOIN dbo.Roles r ON r.ExternalId=s.RoleExternalId WHERE hs.Id IS NULL OR r.Id IS NULL;
    SELECT @UpdatedCount=COUNT(*) FROM @Source s JOIN dbo.HuddleSegmentRoles t ON t.ExternalId=s.ExternalId;
    UPDATE t SET t.HuddleSegmentId=hs.Id,t.RoleId=r.Id,t.DisplayName=s.DisplayName,t.UpdatedAtUtc=SYSUTCDATETIME() FROM dbo.HuddleSegmentRoles t JOIN @Source s ON s.ExternalId=t.ExternalId JOIN dbo.HuddleSegments hs ON hs.ExternalId=s.SegmentExternalId JOIN dbo.Roles r ON r.ExternalId=s.RoleExternalId;
    INSERT dbo.HuddleSegmentRoles(ExternalId,HuddleSegmentId,RoleId,DisplayName,CreatedAtUtc) SELECT s.ExternalId,hs.Id,r.Id,s.DisplayName,SYSUTCDATETIME() FROM @Source s JOIN dbo.HuddleSegments hs ON hs.ExternalId=s.SegmentExternalId JOIN dbo.Roles r ON r.ExternalId=s.RoleExternalId WHERE NOT EXISTS(SELECT 1 FROM dbo.HuddleSegmentRoles t WHERE t.ExternalId=s.ExternalId); SET @InsertedCount=@@ROWCOUNT; SET @SkippedCount=@SourceCount-@InsertedCount-@UpdatedCount;
    SELECT @SourceCount AS SourceCount, @InsertedCount AS InsertedCount, @UpdatedCount AS UpdatedCount, @SkippedCount AS SkippedCount, @DuplicateCount AS DuplicateExternalIds, @MissingRelationshipCount AS MissingRelationships;
    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
    THROW;
END CATCH;
GO
