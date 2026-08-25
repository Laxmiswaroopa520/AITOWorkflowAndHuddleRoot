/*
    Step 3. Deletes the Huddle content so the new workbook data loads into an empty catalogue.

    Order is children before parents. Every foreign key in this schema is Restrict, so nothing
    cascades and each table has to be cleared explicitly.

    WHAT IS KEPT, deliberately:
      Roles                  the Workflow side references it through Activity.RoleId, so deleting
                             it would break the Workflow feature. The v4 scripts update roles in
                             place by ExternalId instead.
      HuddleSegments         reference data, re-merged in place by the v4 scripts.
      HuddleSegmentRoles     as above, and UserHuddlePlans.HuddleSegmentRoleId points at it.
      HuddleFocusAreas       reference data, re-merged in place.
      HuddleMcemStages       reference data, re-merged in place, and script 02 adds StageNumber.
      UserHuddleLaunchPlans  no catalogue foreign key.

    Run step 2 first. If user rows still exist this script will fail on a foreign key, which is
    the intended behaviour rather than a silent partial delete.

    SAFETY: this script does nothing until you set the flag below to 1.
*/
SET NOCOUNT ON;
SET XACT_ABORT ON;

DECLARE @IUnderstandThisDeletesContent BIT = 0;   -- <=== set to 1 to actually run

IF @IUnderstandThisDeletesContent <> 1
BEGIN
    PRINT 'Nothing was deleted. Set @IUnderstandThisDeletesContent to 1 to run this script.';
    RETURN;
END

-- Fail early and clearly rather than part way through, if step 2 has not been run.
IF EXISTS (SELECT 1 FROM dbo.UserHuddleSessions)
    OR EXISTS (SELECT 1 FROM dbo.UserHuddlePlanItems)
    OR EXISTS (SELECT 1 FROM dbo.HuddleVotes)
    THROW 51000, 'User progress rows still reference the catalogue. Run 02_Delete_User_Progress.sql first.', 1;

BEGIN TRANSACTION;

-- Activity join tables
DELETE FROM dbo.HuddleActivityAgents;
PRINT CONCAT('HuddleActivityAgents deleted: ', @@ROWCOUNT);
DELETE FROM dbo.HuddleActivityResources;
PRINT CONCAT('HuddleActivityResources deleted: ', @@ROWCOUNT);

-- The prerequisite column is a self reference with NoAction, so it has to be cleared before
-- the rows themselves can go.
UPDATE dbo.HuddleActivities SET PrerequisiteHuddleActivityId = NULL
WHERE PrerequisiteHuddleActivityId IS NOT NULL;
PRINT CONCAT('Activity prerequisites cleared: ', @@ROWCOUNT);

DELETE FROM dbo.HuddleActivities;
PRINT CONCAT('HuddleActivities deleted: ', @@ROWCOUNT);

-- Guides and phases sit between activities and topics or placements.
DELETE FROM dbo.HuddleFacilitatorGuides;
PRINT CONCAT('HuddleFacilitatorGuides deleted: ', @@ROWCOUNT);
DELETE FROM dbo.HuddlePhases;
PRINT CONCAT('HuddlePhases deleted: ', @@ROWCOUNT);

-- Topic join tables
DELETE FROM dbo.HuddleTopicAgents;
PRINT CONCAT('HuddleTopicAgents deleted: ', @@ROWCOUNT);
DELETE FROM dbo.HuddleTopicResources;
PRINT CONCAT('HuddleTopicResources deleted: ', @@ROWCOUNT);
DELETE FROM dbo.HuddleTopicMcemStages;
PRINT CONCAT('HuddleTopicMcemStages deleted: ', @@ROWCOUNT);
DELETE FROM dbo.HuddleTopicRoles;
PRINT CONCAT('HuddleTopicRoles deleted: ', @@ROWCOUNT);

-- Agent to resource join
DELETE FROM dbo.HuddleAgentResources;
PRINT CONCAT('HuddleAgentResources deleted: ', @@ROWCOUNT);

-- Placement and the older role-path mapping, both of which point at topics
DELETE FROM dbo.HuddlePlacements;
PRINT CONCAT('HuddlePlacements deleted: ', @@ROWCOUNT);
DELETE FROM dbo.HuddleRolePathItems;
PRINT CONCAT('HuddleRolePathItems deleted: ', @@ROWCOUNT);

-- Parents last
DELETE FROM dbo.HuddleTopics;
PRINT CONCAT('HuddleTopics deleted: ', @@ROWCOUNT);
DELETE FROM dbo.HuddleAgents;
PRINT CONCAT('HuddleAgents deleted: ', @@ROWCOUNT);
DELETE FROM dbo.HuddleResources;
PRINT CONCAT('HuddleResources deleted: ', @@ROWCOUNT);

COMMIT TRANSACTION;
PRINT 'Step 3 complete. The catalogue is empty and ready for the huddle-v4 data scripts.';
GO
