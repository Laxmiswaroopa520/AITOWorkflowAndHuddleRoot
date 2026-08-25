/*
007 - Optional import of existing SharePoint UserWorkflows
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

    DECLARE @Workflows TABLE
    (
      WorkflowId uniqueidentifier NOT NULL, Name nvarchar(200) NOT NULL,
      Description nvarchar(2000) NULL, OwnerObjectId nvarchar(100) NOT NULL,
      OwnerEmail nvarchar(320) NOT NULL, OwnerDisplayName nvarchar(200) NOT NULL,
      RoleExternalId nvarchar(50) NOT NULL, TotalDurationMinutes int NOT NULL,
      IsFavorite bit NOT NULL, CreatedAtUtc datetimeoffset NOT NULL, UpdatedAtUtc datetimeoffset NULL
    );
    INSERT @Workflows VALUES
(N'34d25e4b-e8de-4089-a0d3-e3c4c65bf63b',N'Account Executive Workflow – Jul 24',N'account executive',N'b8b27101-d9b1-40a8-9a44-936fa2aa0c25',N'laxmi.bandaru@cognine.com',N'Laxmi Bandaru',N'ae-ent',165,CAST(0 AS bit),CONVERT(datetimeoffset, N'2026-07-24T07:12:17Z', 127),CONVERT(datetimeoffset, N'2026-07-24T07:12:17Z', 127)),
(N'afe4b0e6-a10b-4a4e-a082-641b64a00ab3',N'Account Executive Workflow – Jul 24(21)',N'ugyugu',N'b8b27101-d9b1-40a8-9a44-936fa2aa0c25',N'laxmi.bandaru@cognine.com',N'Laxmi Bandaru',N'ae-ent',165,CAST(0 AS bit),CONVERT(datetimeoffset, N'2026-07-24T09:02:11Z', 127),CONVERT(datetimeoffset, N'2026-07-24T09:02:11Z', 127));

    INSERT dbo.UserWorkflows
    (Id,Name,Description,OwnerObjectId,OwnerEmail,OwnerDisplayName,RoleId,
     TotalDurationMinutes,IsFavorite,CreatedAtUtc,UpdatedAtUtc)
    SELECT w.WorkflowId,w.Name,w.Description,w.OwnerObjectId,w.OwnerEmail,w.OwnerDisplayName,
           r.Id,w.TotalDurationMinutes,w.IsFavorite,w.CreatedAtUtc,w.UpdatedAtUtc
    FROM @Workflows w
    INNER JOIN dbo.Roles r ON r.ExternalId=w.RoleExternalId
    WHERE NOT EXISTS (SELECT 1 FROM dbo.UserWorkflows x WHERE x.Id=w.WorkflowId);

    DECLARE @Selections TABLE
    (WorkflowId uniqueidentifier, ActivityExternalId nvarchar(100), SortOrder int, AddedAtUtc datetimeoffset);
    INSERT @Selections VALUES
(N'34d25e4b-e8de-4089-a0d3-e3c4c65bf63b',N'ae-msx-report-filtering-guidance',1,CONVERT(datetimeoffset, N'2026-07-24T07:12:17Z', 127)),
(N'34d25e4b-e8de-4089-a0d3-e3c4c65bf63b',N'ae-on-demand-report-generation',2,CONVERT(datetimeoffset, N'2026-07-24T07:12:17Z', 127)),
(N'34d25e4b-e8de-4089-a0d3-e3c4c65bf63b',N'ae-pre-meeting-brief-role-alignment',3,CONVERT(datetimeoffset, N'2026-07-24T07:12:17Z', 127)),
(N'34d25e4b-e8de-4089-a0d3-e3c4c65bf63b',N'ae-partner-strategy-co-sell-execution',4,CONVERT(datetimeoffset, N'2026-07-24T07:12:17Z', 127)),
(N'34d25e4b-e8de-4089-a0d3-e3c4c65bf63b',N'ae-team-briefing-generator',5,CONVERT(datetimeoffset, N'2026-07-24T07:12:17Z', 127)),
(N'afe4b0e6-a10b-4a4e-a082-641b64a00ab3',N'ae-msx-report-filtering-guidance',1,CONVERT(datetimeoffset, N'2026-07-24T09:02:11Z', 127)),
(N'afe4b0e6-a10b-4a4e-a082-641b64a00ab3',N'ae-on-demand-report-generation',2,CONVERT(datetimeoffset, N'2026-07-24T09:02:11Z', 127)),
(N'afe4b0e6-a10b-4a4e-a082-641b64a00ab3',N'ae-pre-meeting-brief-role-alignment',3,CONVERT(datetimeoffset, N'2026-07-24T09:02:11Z', 127)),
(N'afe4b0e6-a10b-4a4e-a082-641b64a00ab3',N'ae-partner-strategy-co-sell-execution',4,CONVERT(datetimeoffset, N'2026-07-24T09:02:11Z', 127)),
(N'afe4b0e6-a10b-4a4e-a082-641b64a00ab3',N'ae-team-briefing-generator',5,CONVERT(datetimeoffset, N'2026-07-24T09:02:11Z', 127));

    INSERT dbo.UserWorkflowActivities(UserWorkflowId,ActivityId,SortOrder,AddedAtUtc)
    SELECT s.WorkflowId,a.Id,s.SortOrder,s.AddedAtUtc
    FROM @Selections s
    INNER JOIN dbo.Activities a ON a.ExternalId=s.ActivityExternalId
    WHERE NOT EXISTS (
      SELECT 1 FROM dbo.UserWorkflowActivities x
      WHERE x.UserWorkflowId=s.WorkflowId AND x.ActivityId=a.Id
    );
    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
    THROW;
END CATCH;
GO
