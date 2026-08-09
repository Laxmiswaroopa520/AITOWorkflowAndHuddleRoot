/*
008 - Optional import of existing SharePoint WorkflowShares
Generated from the uploaded SharePoint CSV exports.
Safe to rerun. Uses ExternalId/name lookups instead of hardcoded identity IDs.
*/
USE [AitoWorkflowAndHuddleGeneratorDb];
GO
SET NOCOUNT ON;
SET XACT_ABORT ON;
GO
BEGIN TRY
    BEGIN TRANSACTION;

    DECLARE @Shares TABLE
    (
      ShareId uniqueidentifier NOT NULL, WorkflowId uniqueidentifier NOT NULL,
      RecipientObjectId nvarchar(100) NOT NULL, RecipientEmail nvarchar(320) NOT NULL,
      RecipientDisplayName nvarchar(200) NOT NULL, SharedByObjectId nvarchar(100) NOT NULL,
      SharedByEmail nvarchar(320) NOT NULL, SharedByDisplayName nvarchar(200) NOT NULL,
      Message nvarchar(2000) NULL, IsRevoked bit NOT NULL,
      RevokedAtUtc datetimeoffset NULL, CreatedAtUtc datetimeoffset NOT NULL
    );
    INSERT @Shares VALUES
(N'1678deaa-2b50-432b-b337-314d78044564',N'34d25e4b-e8de-4089-a0d3-e3c4c65bf63b',N'018ad001-ff53-4723-abed-92c0aca471b6',N'nihar.pulluri@cognine.com',N'Nihar Pulluri',N'b8b27101-d9b1-40a8-9a44-936fa2aa0c25',N'laxmi.bandaru@cognine.com',N'Laxmi Bandaru',N'AE workflow 24/07/2026',CAST(1 AS bit),CONVERT(datetimeoffset, N'2026-07-24T07:16:26Z', 127),CONVERT(datetimeoffset, N'2026-07-24T07:16:26Z', 127)),
(N'b79a820a-fc3a-41f8-8acc-73c7ee823ae7',N'34d25e4b-e8de-4089-a0d3-e3c4c65bf63b',N'018ad001-ff53-4723-abed-92c0aca471b6',N'nihar.pulluri@cognine.com',N'Nihar Pulluri',N'b8b27101-d9b1-40a8-9a44-936fa2aa0c25',N'laxmi.bandaru@cognine.com',N'Laxmi Bandaru',N'sharing you a workflow',CAST(1 AS bit),CONVERT(datetimeoffset, N'2026-07-24T07:16:59Z', 127),CONVERT(datetimeoffset, N'2026-07-24T07:16:59Z', 127)),
(N'b1ed5d80-fc51-4879-97d5-e93b080c13a0',N'34d25e4b-e8de-4089-a0d3-e3c4c65bf63b',N'018ad001-ff53-4723-abed-92c0aca471b6',N'nihar.pulluri@cognine.com',N'Nihar Pulluri',N'b8b27101-d9b1-40a8-9a44-936fa2aa0c25',N'laxmi.bandaru@cognine.com',N'Laxmi Bandaru',NULL,CAST(0 AS bit),NULL,CONVERT(datetimeoffset, N'2026-07-24T08:45:45Z', 127)),
(N'1d2ab38c-1e6c-4de1-bbcf-2db830eeb0cc',N'afe4b0e6-a10b-4a4e-a082-641b64a00ab3',N'018ad001-ff53-4723-abed-92c0aca471b6',N'nihar.pulluri@cognine.com',N'Nihar Pulluri',N'b8b27101-d9b1-40a8-9a44-936fa2aa0c25',N'laxmi.bandaru@cognine.com',N'Laxmi Bandaru',NULL,CAST(1 AS bit),CONVERT(datetimeoffset, N'2026-07-24T09:03:50Z', 127),CONVERT(datetimeoffset, N'2026-07-24T09:03:50Z', 127)),
(N'9071955a-9ef8-424d-961e-19aac5e5367b',N'afe4b0e6-a10b-4a4e-a082-641b64a00ab3',N'018ad001-ff53-4723-abed-92c0aca471b6',N'nihar.pulluri@cognine.com',N'Nihar Pulluri',N'b8b27101-d9b1-40a8-9a44-936fa2aa0c25',N'laxmi.bandaru@cognine.com',N'Laxmi Bandaru',NULL,CAST(0 AS bit),NULL,CONVERT(datetimeoffset, N'2026-07-24T09:04:01Z', 127));

    INSERT dbo.WorkflowShares
    (Id,UserWorkflowId,RecipientObjectId,RecipientEmail,RecipientDisplayName,
     SharedByObjectId,SharedByEmail,SharedByDisplayName,Message,IsRevoked,
     RevokedAtUtc,CreatedAtUtc,UpdatedAtUtc)
    SELECT s.ShareId,s.WorkflowId,s.RecipientObjectId,s.RecipientEmail,s.RecipientDisplayName,
           s.SharedByObjectId,s.SharedByEmail,s.SharedByDisplayName,s.Message,s.IsRevoked,
           s.RevokedAtUtc,s.CreatedAtUtc,NULL
    FROM @Shares s
    WHERE EXISTS (SELECT 1 FROM dbo.UserWorkflows w WHERE w.Id=s.WorkflowId)
      AND NOT EXISTS (SELECT 1 FROM dbo.WorkflowShares x WHERE x.Id=s.ShareId);
    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
    THROW;
END CATCH;
GO
