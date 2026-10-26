/* =============================================================================================
   TEMPLATE -- retire (deactivate) seeded content.  NOT part of the package; never executed.

   Default strategy: DEACTIVATE, do not delete.
   Seeded rows can be referenced by user/runtime data (assignments, votes, launch plans, shares).
   Setting IsActive = 0 hides the row from the product while keeping every foreign key valid and
   the identity value stable. It is reversible with a later version that sets IsActive = 1.

   Use it exactly like new-version-upsert.template.sql (new version file, manifest entry,
   checksum, verify, disposable-database validation, review).

   Rules
   - Name every row explicitly by its business key. No "everything not in this list" logic, no
     NOT MATCHED BY SOURCE, no wildcard WHERE.
   - Only tables that have an IsActive column can be retired this way (see the schema script).
   - Hard deletion (DELETE) is refused by the policy scan unless the manifest step carries a
     non-empty "reviewedDestructive" field naming the reviewer and the ticket. Before such a
     step, prove with a read-only query on a copy of production data that nothing in the
     user/runtime tables references the rows, and have it reviewed. TRUNCATE and DROP are never
     allowed.
   ============================================================================================= */

SET NOCOUNT ON;
GO

DECLARE @Retire TABLE (ExternalId nvarchar(50) NOT NULL PRIMARY KEY);
INSERT INTO @Retire (ExternalId) VALUES
    (N'example-key-to-retire');

UPDATE target
SET    target.IsActive     = 0,
       target.UpdatedAtUtc = SYSUTCDATETIME()
FROM   dbo.Roles AS target                       -- replace with the real reference table
JOIN   @Retire   AS r ON r.ExternalId = target.ExternalId
WHERE  target.IsActive = 1;                      -- already-inactive rows are not touched
GO
