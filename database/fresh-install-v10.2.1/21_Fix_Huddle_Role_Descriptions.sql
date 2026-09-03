/*
    21 - Fix Huddle Role Descriptions (safe, additive backfill)
    ------------------------------------------------------------------
    Root cause: 20_Huddle_Reference_Data.sql's Roles MERGE matches on ExternalId.
    For the 7 Huddle roles that already existed as Workflow roles under a different
    ExternalId (ae-ent, ats-ent, ssp-ent, se-ent, ce-ent, csa-ces, csam-ces), that
    match key meant the MERGE inserted a brand-new ROLE-* row instead of reusing the
    existing, already-described one. This script does NOT undo that insert and does
    NOT delete anything -- the Huddle app's own foreign keys (HuddleSegmentRoles,
    HuddleTopicRoles) already point at the new ROLE-* rows, so removing them would
    break those relationships. Instead this only backfills the missing Description
    on the ROLE-* row by copying it from its matching Workflow-side row (matched on
    Abbreviation), and only where the ROLE-* row's Description is currently NULL.

    Safe to run multiple times. Touches only dbo.Roles.Description. Nothing is
    deleted, no IDs change, no other column is modified.

    RECOMMENDED: take a quick backup of dbo.Roles before running, e.g.:
        SELECT * INTO dbo.Roles_backup_20260902 FROM dbo.Roles;
*/
SET NOCOUNT ON;
SET XACT_ABORT ON;
BEGIN TRANSACTION;

UPDATE huddle
SET huddle.Description = wf.Description,
    huddle.UpdatedAtUtc = SYSUTCDATETIME()
FROM dbo.Roles huddle
INNER JOIN dbo.Roles wf
    ON wf.Abbreviation = huddle.Abbreviation
    AND wf.ExternalId NOT LIKE N'ROLE-%'
WHERE huddle.ExternalId LIKE N'ROLE-%'
  AND huddle.Description IS NULL
  AND wf.Description IS NOT NULL;

-- Show what changed, for your own verification before committing.
SELECT Id, ExternalId, Name, Abbreviation, Segment, Description, UpdatedAtUtc
FROM dbo.Roles
WHERE ExternalId LIKE N'ROLE-%'
ORDER BY SortOrder;

COMMIT TRANSACTION;
GO
