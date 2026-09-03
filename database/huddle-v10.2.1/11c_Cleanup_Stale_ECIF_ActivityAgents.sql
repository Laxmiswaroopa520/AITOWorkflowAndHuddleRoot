/*
    Cleanup: stale ECIF Agent attribution rows left behind by the V10.2.1 content correction.

    Run this AFTER 11_Seed_Topic_And_Agent_Joins.sql and BEFORE 12_Seed_Activity_Joins.sql.
    (This script used to be numbered 13 and documented as running after script 12 -- that was
    wrong. See the note at the bottom of this header for why it has to run first.)

    What happened: in the workbook, 6 ECIF-related activities used to carry two
    HuddleActivityAgents rows each -- one for AGT-001 (Sales Agent) as the "Primary" agent, and
    one for AGT-002 (ECIF Agent) as "Surfaced". V10.2.1 corrects the attribution: each of those
    activities now has a single row, AGT-002 (ECIF Agent) as "Primary", with the label "ECIF
    Agent, surfaced through Sales Agent". Script 12 MERGEs in that corrected row -- but it cannot
    remove the two old rows per activity, since MERGE here never deletes.

    Verified by diffing the V8.0 and V10.2.1 workbooks' Activity_Agents sheets directly: these are
    the only 12 (ActivityID, AgentID, UsageType) combinations present in V8.0 and absent from
    V10.2.1 -- every other change between the two workbooks is a straightforward add or an
    in-place content edit, both of which script 12's MERGE already handles.

    Why this has to run BEFORE script 12, not after: script 12's MERGE is keyed on
    (HuddleActivityId, HuddleAgentId, UsageType). The corrected row for, e.g., AE-03-ECIF-01 is
    (AGT-002, Primary) -- a different UsageType than the stale (AGT-002, Surfaced) row already in
    the table, so MERGE doesn't recognize it as an update to an existing row and tries to INSERT
    it fresh. That INSERT collides with the still-present stale (AGT-001, Primary) row on the
    UNIQUE index IX_HuddleActivityAgents_HuddleActivityId_DisplayOrder, since both claim position
    1 for the same activity. Deleting the stale rows first clears position 1 so script 12's
    MERGE can insert the corrected row cleanly. This affects all 6 activities listed below the
    same way.

    Affected activities: AE-03-ECIF-01, CE-05-ECIF-01, CSA-02-ECIF-01, SE-01-ECIF-01,
    WF-X-ORCH-01-P-ATS-ECIF02, WF-X-ORCH-01-P-ATS-ECIF03.

    This script only needs to run once. 14_Validate_Import.sql already checks (after script 12
    has run) that each of these 6 activities ends up with exactly one agent row -- that's the
    real confirmation this worked, not anything in this script.
*/
SET NOCOUNT ON;
SET XACT_ABORT ON;
BEGIN TRANSACTION;

DECLARE @stale TABLE ([ActivityExternalId] NVARCHAR(100), [AgentExternalId] NVARCHAR(100), [UsageType] NVARCHAR(50));
INSERT INTO @stale VALUES
    (N'AE-03-ECIF-01',               N'AGT-001', N'Primary'),
    (N'AE-03-ECIF-01',               N'AGT-002', N'Surfaced'),
    (N'CE-05-ECIF-01',               N'AGT-001', N'Primary'),
    (N'CE-05-ECIF-01',               N'AGT-002', N'Surfaced'),
    (N'CSA-02-ECIF-01',              N'AGT-001', N'Primary'),
    (N'CSA-02-ECIF-01',              N'AGT-002', N'Surfaced'),
    (N'SE-01-ECIF-01',               N'AGT-001', N'Primary'),
    (N'SE-01-ECIF-01',               N'AGT-002', N'Surfaced'),
    (N'WF-X-ORCH-01-P-ATS-ECIF02',   N'AGT-001', N'Primary'),
    (N'WF-X-ORCH-01-P-ATS-ECIF02',   N'AGT-002', N'Surfaced'),
    (N'WF-X-ORCH-01-P-ATS-ECIF03',   N'AGT-001', N'Primary'),
    (N'WF-X-ORCH-01-P-ATS-ECIF03',   N'AGT-002', N'Surfaced');

-- Preview: what this script is about to delete. Inspect this result set before trusting the
-- DELETE below -- if row counts here look wrong, stop and do not let the transaction commit.
PRINT '--- Rows about to be deleted ---';
SELECT a.ExternalId AS [Activity], ag.ExternalId AS [Agent], aa.UsageType, aa.DisplayLabel
FROM dbo.HuddleActivityAgents aa
INNER JOIN dbo.HuddleActivities a ON a.Id = aa.HuddleActivityId
INNER JOIN dbo.HuddleAgents ag ON ag.Id = aa.HuddleAgentId
INNER JOIN @stale s ON s.ActivityExternalId = a.ExternalId
    AND s.AgentExternalId = ag.ExternalId AND s.UsageType = aa.UsageType
ORDER BY a.ExternalId, aa.UsageType;

DELETE aa
FROM dbo.HuddleActivityAgents aa
INNER JOIN dbo.HuddleActivities a ON a.Id = aa.HuddleActivityId
INNER JOIN dbo.HuddleAgents ag ON ag.Id = aa.HuddleAgentId
INNER JOIN @stale s ON s.ActivityExternalId = a.ExternalId
    AND s.AgentExternalId = ag.ExternalId AND s.UsageType = aa.UsageType;

DECLARE @deleted INT = @@ROWCOUNT;
PRINT '--- Rows deleted: ' + CAST(@deleted AS NVARCHAR(10)) + ' ---';

-- This should only ever run once, before script 12 has ever successfully inserted the corrected
-- rows -- so 12 is the expected count. If it reads 0, this cleanup already happened (e.g. you're
-- re-running this by mistake after it already succeeded) -- harmless, but there's nothing left to
-- do here.
IF @deleted NOT IN (0, 12)
    THROW 51000, 'Expected to delete 0 or 12 stale HuddleActivityAgents rows but the actual count differed. Rolling back -- check manually before trusting this data.', 1;

COMMIT TRANSACTION;
GO
