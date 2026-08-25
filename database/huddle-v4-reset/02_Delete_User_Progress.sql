/*
    Step 2. Deletes user progress records. THIS IS DESTRUCTIVE AND CANNOT BE UNDONE.

    You have to run this before step 3. Every foreign key from these tables into the Huddle
    catalogue is Restrict, so the content delete will fail while any of these rows exist:

        UserHuddlePlanItems.HuddleTopicId        -> HuddleTopics
        UserHuddleSessions.HuddleTopicId         -> HuddleTopics
        UserHuddleSessions.CurrentHuddlePhaseId  -> HuddlePhases
        UserHuddleActivityProgress.HuddleActivityId -> HuddleActivities
        HuddleVotes.HuddleTopicId                -> HuddleTopics

    This removes saved progress, completed activities, saved Role Paths and votes. If any of
    that is real rather than test data, stop and say so before running this.

    UserHuddleLaunchPlans has no foreign key into the catalogue and is deliberately left alone,
    so Launch Planner records survive.

    SAFETY: this script does nothing until you set the flag below to 1.
*/
SET NOCOUNT ON;
SET XACT_ABORT ON;

DECLARE @IUnderstandThisDeletesUserData BIT = 0;   -- <=== set to 1 to actually run

IF @IUnderstandThisDeletesUserData <> 1
BEGIN
    PRINT 'Nothing was deleted. Set @IUnderstandThisDeletesUserData to 1 to run this script.';
    PRINT 'Rows that would be deleted:';
    SELECT N'UserHuddleActivityProgress' AS [TableName], COUNT(*) AS [Rows] FROM dbo.UserHuddleActivityProgress
    UNION ALL SELECT N'UserHuddleSessions', COUNT(*) FROM dbo.UserHuddleSessions
    UNION ALL SELECT N'UserHuddlePlanItems', COUNT(*) FROM dbo.UserHuddlePlanItems
    UNION ALL SELECT N'UserHuddlePlans', COUNT(*) FROM dbo.UserHuddlePlans
    UNION ALL SELECT N'HuddleVotes', COUNT(*) FROM dbo.HuddleVotes;
    RETURN;
END

BEGIN TRANSACTION;

-- UserHuddleActivityProgress cascades from UserHuddleSessions, and UserHuddlePlanItems cascades
-- from UserHuddlePlans, but both are deleted explicitly so the row counts are visible.
DELETE FROM dbo.UserHuddleActivityProgress;
PRINT CONCAT('UserHuddleActivityProgress deleted: ', @@ROWCOUNT);

DELETE FROM dbo.UserHuddleSessions;
PRINT CONCAT('UserHuddleSessions deleted: ', @@ROWCOUNT);

DELETE FROM dbo.UserHuddlePlanItems;
PRINT CONCAT('UserHuddlePlanItems deleted: ', @@ROWCOUNT);

DELETE FROM dbo.UserHuddlePlans;
PRINT CONCAT('UserHuddlePlans deleted: ', @@ROWCOUNT);

DELETE FROM dbo.HuddleVotes;
PRINT CONCAT('HuddleVotes deleted: ', @@ROWCOUNT);

COMMIT TRANSACTION;
PRINT 'Step 2 complete.';
GO
