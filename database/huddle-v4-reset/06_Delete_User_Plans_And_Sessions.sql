/* =============================================================================================
   06_Delete_User_Plans_And_Sessions.sql

   Clears saved Role Path plans and Huddle session progress.

   WHY THIS IS NEEDED
   Existing plans were saved against a seven-item path numbered Weeks 2 to 8. The workbook's
   Role_Paths sheet defines eight weeks numbered 1 to 8, with Week 1 being the orientation
   placement, so every stored plan now covers the wrong set of weeks and the API rejects it with
   "The saved Huddle plan is incomplete or invalid."

   Session progress is cleared alongside it because UserHuddleActivityProgress rows point at
   activity ids chosen under the old topic-scoped reading, which mixed activities from several
   roles' placements of the same topic.

   WHAT THIS DOES NOT TOUCH
   Huddle catalogue content (topics, placements, phases, activities, agents, resources, guides) is
   untouched. Reference data is untouched. UserHuddleLaunchPlans is untouched: it has no foreign key
   into the catalogue and the Launch Planner is unaffected by this change.

   SAFETY
   The flag below is 0. Nothing runs until you change it to 1. Pressing F5 by accident deletes
   nothing. The whole script runs in one transaction with XACT_ABORT ON, so a failure rolls back
   rather than leaving progress half-cleared.
   ============================================================================================= */

SET NOCOUNT ON;
SET XACT_ABORT ON;

DECLARE @IUnderstandThisDeletesSavedProgress BIT = 0;   -- <== change to 1 to run

IF @IUnderstandThisDeletesSavedProgress <> 1
BEGIN
    PRINT 'Nothing deleted. Set @IUnderstandThisDeletesSavedProgress to 1 and run again.';
    PRINT '';
    PRINT 'Current row counts:';

    SELECT 'UserHuddlePlans'            AS [Table], COUNT(*) AS [Rows] FROM dbo.UserHuddlePlans
    UNION ALL SELECT 'UserHuddlePlanItems',         COUNT(*) FROM dbo.UserHuddlePlanItems
    UNION ALL SELECT 'UserHuddleSessions',          COUNT(*) FROM dbo.UserHuddleSessions
    UNION ALL SELECT 'UserHuddleActivityProgress',  COUNT(*) FROM dbo.UserHuddleActivityProgress
    UNION ALL SELECT 'UserHuddleLaunchPlans (kept)', COUNT(*) FROM dbo.UserHuddleLaunchPlans;

    RETURN;
END;

BEGIN TRANSACTION;

    DECLARE @progress INT, @sessions INT, @planItems INT, @plans INT;

    /* Child rows first. Every foreign key from these tables into the catalogue is Restrict, so
       nothing cascades and the order below matters. */

    DELETE FROM dbo.UserHuddleActivityProgress;
    SET @progress = @@ROWCOUNT;

    DELETE FROM dbo.UserHuddleSessions;
    SET @sessions = @@ROWCOUNT;

    DELETE FROM dbo.UserHuddlePlanItems;
    SET @planItems = @@ROWCOUNT;

    DELETE FROM dbo.UserHuddlePlans;
    SET @plans = @@ROWCOUNT;

    /* Assert the tables really are empty before committing. */
    IF EXISTS (SELECT 1 FROM dbo.UserHuddlePlanItems)
        OR EXISTS (SELECT 1 FROM dbo.UserHuddlePlans)
        OR EXISTS (SELECT 1 FROM dbo.UserHuddleSessions)
        OR EXISTS (SELECT 1 FROM dbo.UserHuddleActivityProgress)
    BEGIN
        THROW 51000, 'User progress tables are not empty after the delete. Rolled back.', 1;
    END;

    PRINT 'Deleted:';
    PRINT '  UserHuddleActivityProgress : ' + CAST(@progress  AS VARCHAR(20));
    PRINT '  UserHuddleSessions         : ' + CAST(@sessions  AS VARCHAR(20));
    PRINT '  UserHuddlePlanItems        : ' + CAST(@planItems AS VARCHAR(20));
    PRINT '  UserHuddlePlans            : ' + CAST(@plans     AS VARCHAR(20));

COMMIT TRANSACTION;

PRINT '';
PRINT 'Done. Reopen the app, pick an audience, and the Role Path rebuilds from HuddlePlacements';
PRINT 'as W1 through W8. Launch Planner records were not touched.';
