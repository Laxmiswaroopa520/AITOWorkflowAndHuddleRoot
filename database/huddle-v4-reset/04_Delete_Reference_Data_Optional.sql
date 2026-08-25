/*
    Step 4, OPTIONAL. Only run this if you want the reference tables emptied as well.

    You do not need it. The huddle-v4 data scripts MERGE these tables by ExternalId, so they are
    corrected in place. Running this is only worth it if the current reference rows use different
    ExternalIds from the workbook and you want the old ones gone.

    Roles is NOT deleted here even with the flag set. The Workflow feature references it through
    Activity.RoleId, and clearing it would break Workflow. Old role rows are harmless: the v4
    scripts add or update the eight the workbook defines and leave the rest alone.

    Run step 3 first. Deleting HuddleSegmentRoles also requires UserHuddlePlans to be gone,
    which step 2 handles.

    SAFETY: this script does nothing until you set the flag below to 1.
*/
SET NOCOUNT ON;
SET XACT_ABORT ON;

DECLARE @IUnderstandThisDeletesReferenceData BIT = 1;   -- <=== set to 1 to actually run

IF @IUnderstandThisDeletesReferenceData <> 1
BEGIN
    PRINT 'Nothing was deleted. This step is optional; set the flag to 1 only if you want it.';
    RETURN;
END

IF EXISTS (SELECT 1 FROM dbo.HuddleTopics) OR EXISTS (SELECT 1 FROM dbo.HuddlePlacements)
    THROW 51000, 'Huddle content still exists. Run 03_Delete_Huddle_Content.sql first.', 1;

IF EXISTS (SELECT 1 FROM dbo.UserHuddlePlans)
    THROW 51000, 'UserHuddlePlans still reference HuddleSegmentRoles. Run 02_Delete_User_Progress.sql first.', 1;

BEGIN TRANSACTION;

DELETE FROM dbo.HuddleSegmentRoles;
PRINT CONCAT('HuddleSegmentRoles deleted: ', @@ROWCOUNT);
DELETE FROM dbo.HuddleSegments;
PRINT CONCAT('HuddleSegments deleted: ', @@ROWCOUNT);
DELETE FROM dbo.HuddleFocusAreas;
PRINT CONCAT('HuddleFocusAreas deleted: ', @@ROWCOUNT);
DELETE FROM dbo.HuddleMcemStages;
PRINT CONCAT('HuddleMcemStages deleted: ', @@ROWCOUNT);

COMMIT TRANSACTION;
PRINT 'Step 4 complete. Roles was intentionally left alone.';
GO
