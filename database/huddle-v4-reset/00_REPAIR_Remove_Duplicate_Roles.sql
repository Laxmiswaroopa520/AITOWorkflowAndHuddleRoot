/*
    Repair. Removes the eight duplicate role rows that 02_Seed_Reference_Data.sql inserted
    when it was keyed on ExternalId, together with the eight segment roles it created for them.

    Confirmed safe by the diagnosis: all 186 Activities.RoleId references point at the pre-V4
    rows (ae-ent, ats-ent, ce-ent, csa-ces, csam-ces, se-ent, ssp-ent, sm-mgr), and nothing
    points at the ROLE-* rows except the SR-ENT-* segment roles created in the same run.

    The pre-V4 roles are kept exactly as they are, ExternalIds included, because the Workflow
    feature depends on them and the frontend keys its role icons off those values.

    Run this once, then continue with the reset and load sequence.

    SAFETY: this script does nothing until you set the flag below to 1.
*/
SET NOCOUNT ON;
SET XACT_ABORT ON;

DECLARE @IUnderstandThisDeletesRows BIT = 1;   -- <=== set to 1 to actually run

IF @IUnderstandThisDeletesRows <> 1
BEGIN
    PRINT 'Nothing was deleted. Set @IUnderstandThisDeletesRows to 1 to run this script.';
    PRINT 'Rows that would be removed:';
    SELECT N'HuddleSegmentRoles' AS [TableName], ExternalId, Id
    FROM dbo.HuddleSegmentRoles WHERE ExternalId LIKE N'SR-ENT-%'
    UNION ALL
    SELECT N'Roles', ExternalId, Id FROM dbo.Roles WHERE ExternalId LIKE N'ROLE-%'
    ORDER BY [TableName], ExternalId;
    RETURN;
END

-- Refuse to run if anything else has started pointing at these rows in the meantime.
IF EXISTS (
    SELECT 1 FROM dbo.HuddlePlacements p
    INNER JOIN dbo.HuddleSegmentRoles sr ON sr.Id = p.HuddleSegmentRoleId
    WHERE sr.ExternalId LIKE N'SR-ENT-%')
    THROW 51000, 'HuddlePlacements already reference the SR-ENT-* segment roles. Stop and re-check before deleting.', 1;

IF EXISTS (
    SELECT 1 FROM dbo.Activities a
    INNER JOIN dbo.Roles r ON r.Id = a.RoleId
    WHERE r.ExternalId LIKE N'ROLE-%')
    THROW 51000, 'Workflow Activities reference a ROLE-* row. Stop: these roles cannot be deleted.', 1;

IF EXISTS (
    SELECT 1 FROM dbo.UserHuddlePlans up
    INNER JOIN dbo.HuddleSegmentRoles sr ON sr.Id = up.HuddleSegmentRoleId
    WHERE sr.ExternalId LIKE N'SR-ENT-%')
    THROW 51000, 'UserHuddlePlans reference the SR-ENT-* segment roles. Run 02_Delete_User_Progress.sql first.', 1;

BEGIN TRANSACTION;

DELETE FROM dbo.HuddleTopicRoles
WHERE RoleId IN (SELECT Id FROM dbo.Roles WHERE ExternalId LIKE N'ROLE-%');
PRINT CONCAT('HuddleTopicRoles rows removed: ', @@ROWCOUNT);

DELETE FROM dbo.HuddleSegmentRoles WHERE ExternalId LIKE N'SR-ENT-%';
PRINT CONCAT('Duplicate HuddleSegmentRoles removed: ', @@ROWCOUNT);

DELETE FROM dbo.Roles WHERE ExternalId LIKE N'ROLE-%';
PRINT CONCAT('Duplicate Roles removed: ', @@ROWCOUNT);

COMMIT TRANSACTION;

PRINT '--- Roles now ---';
SELECT Id, ExternalId, [Name], Abbreviation, Segment FROM dbo.Roles ORDER BY Abbreviation;

PRINT '--- Every abbreviation should now appear exactly once ---';
SELECT Abbreviation, COUNT(*) AS [RowCount] FROM dbo.Roles
GROUP BY Abbreviation HAVING COUNT(*) > 1;

PRINT 'Repair complete. There is no ALL role yet; the regenerated script 02 inserts it.';
GO
