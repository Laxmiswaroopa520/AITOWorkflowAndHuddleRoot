/* =============================================================================================
   TEMPLATE -- new seed version (delta upsert).  NOT part of the package: it lives under
   database/seed/templates, is not listed in seed-manifest.json and is never executed.

   How to use
   1. Copy to sql/steps/<script-id>/v00N__<short_description>.sql   (N = previous version + 1).
      <script-id> is the id of the logical script in seed-manifest.json, e.g. huddle-topics.
   2. Put ONLY the new or changed rows in @Source (a delta), not the whole content set again.
   3. Run:  python seed_runner.py checksum sql/steps/<script-id>/v00N__<...>.sql
   4. Add a step to seed-manifest.json: same "id", "version": N, the "file", the "sha256".
      Keep every earlier version in the manifest and on disk, untouched.
   5. If the change raises a table's row count, raise the minimum in sql/gates/post/91_*.sql and
      update that gate's checksum in the manifest, in the same pull request.
   6. python seed_runner.py verify   -> then review, then validate on a disposable database.

   Rules (the runner's policy scan rejects violations at verify/package/apply time)
   - Do NOT edit a version that has been applied anywhere. Add a new version instead.
   - Do NOT open or commit a transaction here. The runner wraps this script and its history row in
     ONE transaction; a failure rolls back both. (The v1 baseline scripts carry their own
     BEGIN TRY / BEGIN TRANSACTION; that is tolerated, but new versions should not copy it.)
     The policy scan rejects DDL, TRUNCATE, DROP, IDENTITY_INSERT, dynamic SQL, DBCC and
     MERGE ... NOT MATCHED BY SOURCE, and any reference to user/runtime/history tables.
   - Key rows on the stable business key (ExternalId / Slug / Code), never on identity values.
   - Touch only reference/content tables. Never user, vote, share, launch-plan or runtime tables.
   - Write only when something really differs, so a re-run changes nothing and UpdatedAtUtc is not
     reset for rows that already match.
   ============================================================================================= */

SET NOCOUNT ON;
GO

DECLARE @Source TABLE
(
    ExternalId   nvarchar(50)   NOT NULL PRIMARY KEY,
    Name         nvarchar(150)  NOT NULL,
    Description  nvarchar(1000) NULL,
    SortOrder    int            NOT NULL,
    IsActive     bit            NOT NULL
);

INSERT INTO @Source (ExternalId, Name, Description, SortOrder, IsActive) VALUES
    (N'example-key-1', N'Example name', N'Example description.', 100, CAST(1 AS bit));

-- 1. Update only rows that exist AND differ. Matching rows are left completely alone.
UPDATE target
SET    target.Name         = src.Name,
       target.Description  = src.Description,
       target.SortOrder    = src.SortOrder,
       target.IsActive     = src.IsActive,
       target.UpdatedAtUtc = SYSUTCDATETIME()
FROM   dbo.Roles AS target                       -- replace with the real reference table
JOIN   @Source   AS src ON src.ExternalId = target.ExternalId
WHERE  ISNULL(target.Name, N'')        <> ISNULL(src.Name, N'')
   OR  ISNULL(target.Description, N'') <> ISNULL(src.Description, N'')
   OR  target.SortOrder                <> src.SortOrder
   OR  target.IsActive                 <> src.IsActive;

-- 2. Insert only rows that are missing.
INSERT dbo.Roles (ExternalId, Name, Description, SortOrder, IsActive, CreatedAtUtc, UpdatedAtUtc)
SELECT src.ExternalId, src.Name, src.Description, src.SortOrder, src.IsActive, SYSUTCDATETIME(), NULL
FROM   @Source AS src
WHERE  NOT EXISTS (SELECT 1 FROM dbo.Roles AS target WHERE target.ExternalId = src.ExternalId);
GO
