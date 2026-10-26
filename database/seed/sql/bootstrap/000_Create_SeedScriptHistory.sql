/* =============================================================================================
   000_Create_SeedScriptHistory.sql   (runner bootstrap -- idempotent, safe to run every time)

   Creates dbo.SeedScriptHistory, the execution history for the versioned seed scripts under
   database/seed/sql/steps. It is NOT EF Core's __EFMigrationsHistory (EF does not track plain
   SQL seed scripts) and EF does not know this table; it is created and read only by
   seed_runner.py.

   One row per ATTEMPT to run one version of one seed script:

     Status 'Started'      the runner began the script; its data changes are still uncommitted.
     Status 'Succeeded'    the script's data changes and this status were committed together in
                           one transaction. This is the ONLY state that makes a version "applied".
     Status 'Failed'       the script raised an error; its transaction was rolled back.
     Status 'Interrupted'  a 'Started' row left behind by a runner that died. SQL Server rolled
                           the transaction back when the connection dropped, so no data landed.

   The filtered unique index guarantees at most one 'Succeeded' row per (ScriptId, ScriptVersion).
   ============================================================================================= */

SET NOCOUNT ON;
GO

IF OBJECT_ID(N'dbo.SeedScriptHistory', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.SeedScriptHistory
    (
        SeedScriptHistoryId bigint         IDENTITY(1,1) NOT NULL,
        ScriptId            nvarchar(100)  NOT NULL,
        ScriptVersion       int            NOT NULL,
        FileName            nvarchar(260)  NOT NULL,
        ChecksumSha256      char(64)       NOT NULL,
        [Status]            varchar(20)    NOT NULL,
        StartedAtUtc        datetime2(3)   NOT NULL CONSTRAINT DF_SeedScriptHistory_StartedAtUtc DEFAULT (SYSUTCDATETIME()),
        CompletedAtUtc      datetime2(3)   NULL,
        AppliedAtUtc        datetime2(3)   NULL,
        DurationMs          int            NULL,
        RunnerVersion       varchar(20)    NULL,
        RunnerHost          nvarchar(128)  NULL,
        BuildId             nvarchar(100)  NULL,
        ErrorMessage        nvarchar(4000) NULL,
        CONSTRAINT PK_SeedScriptHistory PRIMARY KEY CLUSTERED (SeedScriptHistoryId),
        CONSTRAINT CK_SeedScriptHistory_Status CHECK ([Status] IN ('Started', 'Succeeded', 'Failed', 'Interrupted')),
        CONSTRAINT CK_SeedScriptHistory_Version CHECK (ScriptVersion >= 1),
        CONSTRAINT CK_SeedScriptHistory_AppliedAtUtc CHECK (([Status] = 'Succeeded' AND AppliedAtUtc IS NOT NULL)
                                                         OR ([Status] <> 'Succeeded' AND AppliedAtUtc IS NULL))
    );
END;
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes
               WHERE name = N'UX_SeedScriptHistory_Succeeded'
                 AND object_id = OBJECT_ID(N'dbo.SeedScriptHistory'))
BEGIN
    CREATE UNIQUE NONCLUSTERED INDEX UX_SeedScriptHistory_Succeeded
        ON dbo.SeedScriptHistory (ScriptId, ScriptVersion)
        WHERE [Status] = 'Succeeded';
END;
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes
               WHERE name = N'IX_SeedScriptHistory_ScriptId_ScriptVersion'
                 AND object_id = OBJECT_ID(N'dbo.SeedScriptHistory'))
BEGIN
    CREATE NONCLUSTERED INDEX IX_SeedScriptHistory_ScriptId_ScriptVersion
        ON dbo.SeedScriptHistory (ScriptId, ScriptVersion, StartedAtUtc);
END;
GO
