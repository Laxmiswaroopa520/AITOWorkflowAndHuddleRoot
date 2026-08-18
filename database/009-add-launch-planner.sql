IF OBJECT_ID(N'dbo.UserLaunchPlans', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.UserLaunchPlans
    (
        Id uniqueidentifier NOT NULL CONSTRAINT PK_UserLaunchPlans PRIMARY KEY,
        OwnerObjectId nvarchar(128) NOT NULL,
        TeamName nvarchar(200) NOT NULL,
        CohortName nvarchar(200) NOT NULL,
        FirstHuddleDate date NOT NULL,
        CompletedActivityIdsJson nvarchar(max) NOT NULL CONSTRAINT DF_UserLaunchPlans_Completed DEFAULT N'[]',
        CreatedAtUtc datetimeoffset NOT NULL,
        UpdatedAtUtc datetimeoffset NULL,
        RowVersion rowversion NOT NULL
    );
    CREATE UNIQUE INDEX UX_UserLaunchPlans_OwnerObjectId ON dbo.UserLaunchPlans(OwnerObjectId);
END
GO
