/*
    Cleanup: stale HuddleTopicMcemStages row left behind by a V10.2.1 content correction.

    Run this AFTER 10_Seed_Huddle_Activity_Prerequisites.sql and BEFORE
    11_Seed_Topic_And_Agent_Joins.sql. Read it before you run it.

    What happened: in the data you already loaded, WF-X-RENEW-01 was linked to MCEM-04 at
    position 1. The V10.2.1 workbook corrects this topic's MCEM stage to MCEM-05, still at
    position 1 -- every other topic's Topic_MCEM assignment is unchanged between what's in your
    database and the V10.2.1 workbook (verified directly: all other 21 topics currently in
    dbo.HuddleTopicMcemStages match the V10.2.1 workbook exactly, stage-for-stage and
    position-for-position -- WF-X-RENEW-01 is the only one that moved).

    Script 11's MERGE is keyed on (HuddleTopicId, HuddleMcemStageId), so it can insert the
    corrected (WF-X-RENEW-01, MCEM-05, 1) row cleanly, but it has no way to remove the old
    (WF-X-RENEW-01, MCEM-04, 1) row -- MERGE here never deletes, same as everywhere else in this
    folder. That leftover row collides with the corrected one on the UNIQUE index
    IX_HuddleTopicMcemStages_HuddleTopicId_DisplayOrder, since both claim position 1 for the same
    topic. This script removes only that one stale row.
*/
SET NOCOUNT ON;
SET XACT_ABORT ON;
BEGIN TRANSACTION;

-- Preview: the row this script is about to delete (nothing prints if it's already gone).
PRINT '--- Row about to be deleted (if present) ---';
SELECT t.ExternalId AS [Topic], mc.ExternalId AS [McemStage], tm.DisplayOrder
FROM dbo.HuddleTopicMcemStages tm
INNER JOIN dbo.HuddleTopics t ON t.Id = tm.HuddleTopicId
INNER JOIN dbo.HuddleMcemStages mc ON mc.Id = tm.HuddleMcemStageId
WHERE t.ExternalId = N'WF-X-RENEW-01' AND mc.ExternalId = N'MCEM-04';

DELETE tm
FROM dbo.HuddleTopicMcemStages tm
INNER JOIN dbo.HuddleTopics t ON t.Id = tm.HuddleTopicId
INNER JOIN dbo.HuddleMcemStages mc ON mc.Id = tm.HuddleMcemStageId
WHERE t.ExternalId = N'WF-X-RENEW-01' AND mc.ExternalId = N'MCEM-04';

DECLARE @deleted INT = @@ROWCOUNT;
PRINT '--- Rows deleted: ' + CAST(@deleted AS NVARCHAR(10)) + ' ---';

-- 0 is fine (means this cleanup already ran, or script 11 already succeeded once with this row
-- gone) -- this script is safe to re-run. Anything other than 0 or 1 means something unexpected
-- is in the table and this should be checked manually before proceeding.
IF @deleted NOT IN (0, 1)
    THROW 51000, 'Expected to delete 0 or 1 stale HuddleTopicMcemStages row but the actual count differed. Rolling back -- check manually.', 1;

COMMIT TRANSACTION;
GO
