/*
    22 - Backfill descriptions for roles that have NO Workflow-side counterpart to
    copy from (DRAFT - review/edit the text below before running)
    ------------------------------------------------------------------
    These 6 roles never had description text anywhere in the workbook or any script,
    in V8 or V10.2.1: ROLE-ALL ("All Roles") and the 5 new SME&C roles. The text
    below is a first DRAFT, written in the same style as the existing 8 role
    descriptions, for your review -- edit any line before running, or replace with
    your own text if you have it saved elsewhere.

    Safe to run multiple times. Touches only dbo.Roles.Description, matched by
    ExternalId. Nothing is deleted, no IDs change.
*/
SET NOCOUNT ON;
SET XACT_ABORT ON;
BEGIN TRANSACTION;

UPDATE dbo.Roles SET Description = N'Applies across every role; used for huddles and activities relevant to the whole team regardless of function.', UpdatedAtUtc = SYSUTCDATETIME()
WHERE ExternalId = N'ROLE-ALL' AND Description IS NULL;

UPDATE dbo.Roles SET Description = N'Manages a high-volume portfolio of SME&C accounts through digital-first, scaled sales motions.', UpdatedAtUtc = SYSUTCDATETIME()
WHERE ExternalId = N'ROLE-DAE' AND Description IS NULL;

UPDATE dbo.Roles SET Description = N'Drives solution-area opportunities for SME&C customers through scaled, digital engagement models.', UpdatedAtUtc = SYSUTCDATETIME()
WHERE ExternalId = N'ROLE-DSS' AND Description IS NULL;

UPDATE dbo.Roles SET Description = N'Leads technical discovery and solution demonstrations for SME&C accounts through digital-first engagements.', UpdatedAtUtc = SYSUTCDATETIME()
WHERE ExternalId = N'ROLE-DSE' AND Description IS NULL;

UPDATE dbo.Roles SET Description = N'Designs and validates cloud and AI architectures for SME&C customers at scale.', UpdatedAtUtc = SYSUTCDATETIME()
WHERE ExternalId = N'ROLE-DCSA' AND Description IS NULL;

UPDATE dbo.Roles SET Description = N'Drives solution sales and pipeline growth for SME&C customers through the partner channel.', UpdatedAtUtc = SYSUTCDATETIME()
WHERE ExternalId = N'ROLE-PSS' AND Description IS NULL;

SELECT Id, ExternalId, Name, Segment, Description, UpdatedAtUtc
FROM dbo.Roles
WHERE ExternalId IN (N'ROLE-ALL', N'ROLE-DAE', N'ROLE-DSS', N'ROLE-DSE', N'ROLE-DCSA', N'ROLE-PSS')
ORDER BY SortOrder;

COMMIT TRANSACTION;
GO
