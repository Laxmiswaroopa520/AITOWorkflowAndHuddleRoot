/*
    Self-referencing activity prerequisites
    Generated from the Frontier Accelerator content workbook by generate.py.
    Do not hand-edit. Re-runnable: every statement is an ExternalId-keyed MERGE, nothing is deleted.
    65 of 281 activities consume another activity's output. Run after script 09.
*/
SET NOCOUNT ON;
SET XACT_ABORT ON;
DECLARE @unresolved INT;
BEGIN TRANSACTION;

;WITH raw AS (
    SELECT * FROM (VALUES
        (N'AE-02-ALT-01', N'AE-02-P01'),
        (N'AE-02-ALT-02', N'AE-02-P01'),
        (N'AE-02-P02', N'AE-02-P01'),
        (N'AE-03-ALT-01', N'AE-03-P01'),
        (N'AE-03-ALT-02', N'AE-03-P01'),
        (N'AE-04-ALT-01', N'AE-04-P02'),
        (N'AE-04-ALT-02', N'AE-04-P02'),
        (N'AE-05-ALT-01', N'AE-05-DEAL-01'),
        (N'AE-05-ALT-02', N'AE-05-DEAL-01'),
        (N'AE-05-P02', N'AE-05-DEAL-01'),
        (N'AE-06-ALT-01', N'AE-06-P-AE01'),
        (N'AE-07-ALT-01', N'AE-07-P01'),
        (N'AE-07-ALT-02', N'AE-07-P01'),
        (N'AE-07-P02', N'AE-07-P01'),
        (N'CE-01-ALT-01', N'WF-CE-RISK-01-P-CE-01'),
        (N'CE-01-ALT-02', N'WF-CE-RISK-01-P-CE-01'),
        (N'CE-02-ALT-01', N'WF-CE-STRUCT-01-P-CE-02'),
        (N'CE-02-ALT-02', N'WF-CE-STRUCT-01-P-CE-02'),
        (N'CE-03-ALT-01', N'WF-CE-POLICY-01-P-CE-01'),
        (N'CE-03-ALT-02', N'WF-CE-POLICY-01-P-CE-01'),
        (N'CE-04-ALT-01', N'WF-CE-NEG-01-P-CE-01'),
        (N'CE-04-ALT-02', N'WF-CE-NEG-01-P-CE-01'),
        (N'CE-05-ALT-01', N'CE-05-ORCH-01'),
        (N'CE-05-ALT-02', N'CE-05-ORCH-01'),
        (N'CE-06-ALT-01', N'WF-CE-RENEW-01-P-CE-01'),
        (N'CE-06-ALT-02', N'WF-CE-RENEW-01-P-CE-01'),
        (N'CE-07-ALT-02', N'CE-07-ALT-01'),
        (N'CSA-01-ALT-01', N'WF-X-HEALTH-01-P-CSA-01'),
        (N'CSA-01-ALT-02', N'WF-X-HEALTH-01-P-CSA-01'),
        (N'CSA-02-ALT-01', N'WF-ARCH-01-P-CSA-02'),
        (N'CSA-02-ALT-02', N'CSA-02-ALT-01'),
        (N'CSA-03-ALT-01', N'WF-X-ARCH-01-P-CSA-01'),
        (N'CSA-03-ALT-02', N'WF-X-ARCH-01-P-CSA-02'),
        (N'CSA-04-ALT-01', N'WF-TECH-CONV-01-P-CSA-01'),
        (N'CSA-04-ALT-02', N'WF-TECH-CONV-01-P-CSA-01'),
        (N'CSA-05-ALT-01', N'WF-CONSUME-01-P-CSA-01'),
        (N'CSA-05-ALT-02', N'WF-CONSUME-01-P-CSA-01'),
        (N'CSA-06-ALT-01', N'WF-OPT-01-P-CSA-01'),
        (N'CSA-06-ALT-02', N'WF-OPT-01-P-CSA-02'),
        (N'CSA-07-ALT-01', N'WF-VALUE-TECH-01-P-CSA-01'),
        (N'CSA-07-ALT-02', N'WF-VALUE-TECH-01-P-CSA-01'),
        (N'CSAM-INVEST-P05', N'CSAM-INVEST-P01'),
        (N'SE-01-ALT-01', N'WF-SE-DISC-01-P-SE-01'),
        (N'SE-01-ALT-02', N'WF-SE-DISC-01-P-SE-01'),
        (N'SE-02-ALT-01', N'WF-SE-ARCH-01-P-SE-02'),
        (N'SE-02-ALT-02', N'WF-SE-ARCH-01-P-SE-02'),
        (N'SE-03-ALT-01', N'WF-SE-DEMO-01-P-SE-01'),
        (N'SE-03-ALT-02', N'WF-SE-DEMO-01-P-SE-01'),
        (N'SE-04-ALT-01', N'WF-SE-POC-01-P-SE-01'),
        (N'SE-04-ALT-02', N'WF-SE-POC-01-P-SE-01'),
        (N'SE-05-ALT-01', N'WF-SE-QA-01-P-SE-01'),
        (N'SE-05-ALT-02', N'WF-SE-QA-01-P-SE-02'),
        (N'SE-06-ALT-01', N'WF-SE-DEAL-01-P-SE-02'),
        (N'SE-06-ALT-02', N'WF-SE-DEAL-01-P-SE-02'),
        (N'SE-07-ALT-01', N'WF-SE-ASSET-01-P-SE-01'),
        (N'SE-07-ALT-02', N'SE-07-ALT-01'),
        (N'SSP-INVEST-P06', N'SSP-INVEST-01-P02'),
        (N'WF-DEAL-01-P-SSP-03', N'WF-DEAL-01-P-SSP-01'),
        (N'WF-DEAL-01-P-SSP-04', N'WF-DEAL-01-P-SSP-02'),
        (N'WF-LEAD-01-P-SSP-03', N'WF-LEAD-01-P-SSP-01'),
        (N'WF-SOLUTION-01-P-SSP-04', N'WF-SOLUTION-01-P-SSP-02'),
        (N'WF-VALUE-01-P-SSP-03', N'WF-VALUE-01-P-SSP-01'),
        (N'WF-VALUE-01-P-SSP-04', N'WF-VALUE-01-P-SSP-01'),
        (N'WF-VTEAM-01-P-SSP-03', N'WF-VTEAM-01-P-SSP-01'),
        (N'WF-VTEAM-01-P-SSP-04', N'WF-VTEAM-01-P-SSP-01')
    ) v([ActivityExternalId], [PrerequisiteExternalId])
)
UPDATE a SET
    a.PrerequisiteHuddleActivityId = pre.Id,
    a.UpdatedAtUtc = SYSUTCDATETIME()
FROM raw
    INNER JOIN dbo.HuddleActivities AS a ON a.ExternalId = raw.[ActivityExternalId]
    INNER JOIN dbo.HuddleActivities AS pre ON pre.ExternalId = raw.[PrerequisiteExternalId];

;WITH raw AS (
    SELECT * FROM (VALUES
        (N'AE-02-ALT-01', N'AE-02-P01'),
        (N'AE-02-ALT-02', N'AE-02-P01'),
        (N'AE-02-P02', N'AE-02-P01'),
        (N'AE-03-ALT-01', N'AE-03-P01'),
        (N'AE-03-ALT-02', N'AE-03-P01'),
        (N'AE-04-ALT-01', N'AE-04-P02'),
        (N'AE-04-ALT-02', N'AE-04-P02'),
        (N'AE-05-ALT-01', N'AE-05-DEAL-01'),
        (N'AE-05-ALT-02', N'AE-05-DEAL-01'),
        (N'AE-05-P02', N'AE-05-DEAL-01'),
        (N'AE-06-ALT-01', N'AE-06-P-AE01'),
        (N'AE-07-ALT-01', N'AE-07-P01'),
        (N'AE-07-ALT-02', N'AE-07-P01'),
        (N'AE-07-P02', N'AE-07-P01'),
        (N'CE-01-ALT-01', N'WF-CE-RISK-01-P-CE-01'),
        (N'CE-01-ALT-02', N'WF-CE-RISK-01-P-CE-01'),
        (N'CE-02-ALT-01', N'WF-CE-STRUCT-01-P-CE-02'),
        (N'CE-02-ALT-02', N'WF-CE-STRUCT-01-P-CE-02'),
        (N'CE-03-ALT-01', N'WF-CE-POLICY-01-P-CE-01'),
        (N'CE-03-ALT-02', N'WF-CE-POLICY-01-P-CE-01'),
        (N'CE-04-ALT-01', N'WF-CE-NEG-01-P-CE-01'),
        (N'CE-04-ALT-02', N'WF-CE-NEG-01-P-CE-01'),
        (N'CE-05-ALT-01', N'CE-05-ORCH-01'),
        (N'CE-05-ALT-02', N'CE-05-ORCH-01'),
        (N'CE-06-ALT-01', N'WF-CE-RENEW-01-P-CE-01'),
        (N'CE-06-ALT-02', N'WF-CE-RENEW-01-P-CE-01'),
        (N'CE-07-ALT-02', N'CE-07-ALT-01'),
        (N'CSA-01-ALT-01', N'WF-X-HEALTH-01-P-CSA-01'),
        (N'CSA-01-ALT-02', N'WF-X-HEALTH-01-P-CSA-01'),
        (N'CSA-02-ALT-01', N'WF-ARCH-01-P-CSA-02'),
        (N'CSA-02-ALT-02', N'CSA-02-ALT-01'),
        (N'CSA-03-ALT-01', N'WF-X-ARCH-01-P-CSA-01'),
        (N'CSA-03-ALT-02', N'WF-X-ARCH-01-P-CSA-02'),
        (N'CSA-04-ALT-01', N'WF-TECH-CONV-01-P-CSA-01'),
        (N'CSA-04-ALT-02', N'WF-TECH-CONV-01-P-CSA-01'),
        (N'CSA-05-ALT-01', N'WF-CONSUME-01-P-CSA-01'),
        (N'CSA-05-ALT-02', N'WF-CONSUME-01-P-CSA-01'),
        (N'CSA-06-ALT-01', N'WF-OPT-01-P-CSA-01'),
        (N'CSA-06-ALT-02', N'WF-OPT-01-P-CSA-02'),
        (N'CSA-07-ALT-01', N'WF-VALUE-TECH-01-P-CSA-01'),
        (N'CSA-07-ALT-02', N'WF-VALUE-TECH-01-P-CSA-01'),
        (N'CSAM-INVEST-P05', N'CSAM-INVEST-P01'),
        (N'SE-01-ALT-01', N'WF-SE-DISC-01-P-SE-01'),
        (N'SE-01-ALT-02', N'WF-SE-DISC-01-P-SE-01'),
        (N'SE-02-ALT-01', N'WF-SE-ARCH-01-P-SE-02'),
        (N'SE-02-ALT-02', N'WF-SE-ARCH-01-P-SE-02'),
        (N'SE-03-ALT-01', N'WF-SE-DEMO-01-P-SE-01'),
        (N'SE-03-ALT-02', N'WF-SE-DEMO-01-P-SE-01'),
        (N'SE-04-ALT-01', N'WF-SE-POC-01-P-SE-01'),
        (N'SE-04-ALT-02', N'WF-SE-POC-01-P-SE-01'),
        (N'SE-05-ALT-01', N'WF-SE-QA-01-P-SE-01'),
        (N'SE-05-ALT-02', N'WF-SE-QA-01-P-SE-02'),
        (N'SE-06-ALT-01', N'WF-SE-DEAL-01-P-SE-02'),
        (N'SE-06-ALT-02', N'WF-SE-DEAL-01-P-SE-02'),
        (N'SE-07-ALT-01', N'WF-SE-ASSET-01-P-SE-01'),
        (N'SE-07-ALT-02', N'SE-07-ALT-01'),
        (N'SSP-INVEST-P06', N'SSP-INVEST-01-P02'),
        (N'WF-DEAL-01-P-SSP-03', N'WF-DEAL-01-P-SSP-01'),
        (N'WF-DEAL-01-P-SSP-04', N'WF-DEAL-01-P-SSP-02'),
        (N'WF-LEAD-01-P-SSP-03', N'WF-LEAD-01-P-SSP-01'),
        (N'WF-SOLUTION-01-P-SSP-04', N'WF-SOLUTION-01-P-SSP-02'),
        (N'WF-VALUE-01-P-SSP-03', N'WF-VALUE-01-P-SSP-01'),
        (N'WF-VALUE-01-P-SSP-04', N'WF-VALUE-01-P-SSP-01'),
        (N'WF-VTEAM-01-P-SSP-03', N'WF-VTEAM-01-P-SSP-01'),
        (N'WF-VTEAM-01-P-SSP-04', N'WF-VTEAM-01-P-SSP-01')
    ) v([ActivityExternalId], [PrerequisiteExternalId])
)
SELECT @unresolved = 65 - COUNT(*) FROM raw
    INNER JOIN dbo.HuddleActivities AS a ON a.ExternalId = raw.[ActivityExternalId]
    INNER JOIN dbo.HuddleActivities AS pre ON pre.ExternalId = raw.[PrerequisiteExternalId];
IF @unresolved <> 0
    THROW 51000, 'Activity prerequisites: not every reference resolved. Run script 09 first.', 1;

-- Guard on the invariant the workbook actually holds: a prerequisite stays within the same
-- topic and the same segment role, but may point at an earlier placement. That is deliberate
-- content design: a later Huddle's Extended practice can build on an earlier one's output,
-- which is how the three CSA architecture cross-placement references work.
-- Enforced here rather than as a constraint, because this is a content rule not a schema rule.
IF EXISTS (
    SELECT 1
    FROM dbo.HuddleActivities a
    INNER JOIN dbo.HuddleActivities pre ON pre.Id = a.PrerequisiteHuddleActivityId
    INNER JOIN dbo.HuddlePlacements ap ON ap.Id = a.HuddlePlacementId
    INNER JOIN dbo.HuddlePlacements pp ON pp.Id = pre.HuddlePlacementId
    WHERE ap.HuddleTopicId <> pp.HuddleTopicId
       OR ap.HuddleSegmentRoleId <> pp.HuddleSegmentRoleId)
    THROW 51000, 'An activity prerequisite crosses a topic or a role. Check the workbook.', 1;

IF EXISTS (SELECT 1 FROM dbo.HuddleActivities WHERE PrerequisiteHuddleActivityId = Id)
    THROW 51000, 'An activity is its own prerequisite. Check the workbook.', 1;

-- Informational: prerequisites that point at an earlier placement rather than within one.
SELECT a.ExternalId AS [Activity], ap.ExternalId AS [Placement], a.PracticeTier,
       pre.ExternalId AS [RequiresOutputOf], pp.ExternalId AS [FromPlacement], pre.PracticeTier AS [PrerequisiteTier]
FROM dbo.HuddleActivities a
INNER JOIN dbo.HuddleActivities pre ON pre.Id = a.PrerequisiteHuddleActivityId
INNER JOIN dbo.HuddlePlacements ap ON ap.Id = a.HuddlePlacementId
INNER JOIN dbo.HuddlePlacements pp ON pp.Id = pre.HuddlePlacementId
WHERE ap.Id <> pp.Id
ORDER BY a.ExternalId;

COMMIT TRANSACTION;
GO
