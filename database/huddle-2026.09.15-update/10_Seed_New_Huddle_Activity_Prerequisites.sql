
SET NOCOUNT ON;
SET XACT_ABORT ON;
DECLARE @unresolved INT;
BEGIN TRANSACTION;

;WITH raw AS (
    SELECT * FROM (VALUES
        (N'DSE-DISC-02', N'DSE-DISC-01'),
        (N'DSE-DISC-03', N'DSE-DISC-01'),
        (N'DSE-PROOF-02', N'DSE-PROOF-01'),
        (N'DSE-PROOF-03', N'DSE-PROOF-02'),
        (N'DSE-CONV-02', N'DSE-CONV-01'),
        (N'DSE-CONV-03', N'DSE-CONV-01'),
        (N'DSE-HEALTH-02', N'DSE-HEALTH-01'),
        (N'DSE-HEALTH-03', N'DSE-HEALTH-02'),
        (N'DCSA-PART-02', N'DCSA-PART-01'),
        (N'DCSA-PART-03', N'DCSA-PART-02'),
        (N'DCSA-CONV-02', N'DCSA-CONV-01'),
        (N'DCSA-CONV-03', N'DCSA-CONV-01'),
        (N'DCSA-VALUE-02', N'DCSA-VALUE-01'),
        (N'DCSA-VALUE-03', N'DCSA-VALUE-02'),
        (N'PSS-DEM-02', N'PSS-DEM-01'),
        (N'PSS-ORCH-02', N'PSS-ORCH-01'),
        (N'PSS-VAL-02', N'PSS-VAL-01'),
        (N'PSS-VAL-03', N'PSS-VAL-02'),
        (N'SMEC-CE-POL-02', N'SMEC-CE-POL-01'),
        (N'SMEC-CE-POL-03', N'SMEC-CE-POL-01'),
        (N'SMEC-CE-NEG-02', N'SMEC-CE-NEG-01'),
        (N'SMEC-CE-NEG-03', N'SMEC-CE-NEG-01'),
        (N'SMEC-CE-ORCH-02', N'SMEC-CE-ORCH-01'),
        (N'SMEC-CE-DEAL2-02', N'SMEC-CE-DEAL2-01'),
        (N'SMEC-CE-DEAL2-03', N'SMEC-CE-DEAL2-02'),
        (N'DCSA-ARCH-02', N'DCSA-ARCH-01'),
        (N'DCSA-ARCH-03', N'DCSA-ARCH-02'),
        (N'DCSA-HEALTH-02', N'DCSA-HEALTH-01'),
        (N'DCSA-EXPAND-02', N'DCSA-EXPAND-01'),
        (N'DCSA-EXPAND-03', N'DCSA-EXPAND-02'),
        (N'DSE-ASSET-02', N'DSE-ASSET-01'),
        (N'DSE-PARTNER-02', N'DSE-PARTNER-01'),
        (N'DSE-PARTNER-03', N'DSE-PARTNER-02'),
        (N'DSS-COMP-02', N'DSS-COMP-01'),
        (N'DSS-COMP-03', N'DSS-COMP-02'),
        (N'DSS-ORCH-02', N'DSS-ORCH-01'),
        (N'DSS-ORCH-03', N'DSS-ORCH-02'),
        (N'PSS-CAP-02', N'PSS-CAP-01'),
        (N'PSS-CAP-03', N'PSS-CAP-02'),
        (N'PSS-CONV-02', N'PSS-CONV-01'),
        (N'PSS-CONV-03', N'PSS-CONV-02'),
        (N'DSS-INV-02', N'DSS-INV-01'),
        (N'DSS-INV-03', N'DSS-INV-02'),
        (N'PSS-INV-02', N'PSS-INV-01'),
        (N'PSS-INV-03', N'PSS-INV-02'),
        (N'DSS-COMP-04', N'DSS-COMP-03'),
        (N'PSS-CAP-04', N'PSS-CAP-02'),
        (N'DCSA-HEALTH-04', N'DCSA-HEALTH-01'),
        (N'SMEC-CE-RENEW-05', N'SMEC-CE-RENEW-01'),
        (N'ALL-CLOSEDWON-02', N'ALL-CLOSEDWON-01'),
        (N'CSAM-ESCALATE-JAI', N'CSAM-ESCALATE-P02')
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
        (N'DSE-DISC-02', N'DSE-DISC-01'),
        (N'DSE-DISC-03', N'DSE-DISC-01'),
        (N'DSE-PROOF-02', N'DSE-PROOF-01'),
        (N'DSE-PROOF-03', N'DSE-PROOF-02'),
        (N'DSE-CONV-02', N'DSE-CONV-01'),
        (N'DSE-CONV-03', N'DSE-CONV-01'),
        (N'DSE-HEALTH-02', N'DSE-HEALTH-01'),
        (N'DSE-HEALTH-03', N'DSE-HEALTH-02'),
        (N'DCSA-PART-02', N'DCSA-PART-01'),
        (N'DCSA-PART-03', N'DCSA-PART-02'),
        (N'DCSA-CONV-02', N'DCSA-CONV-01'),
        (N'DCSA-CONV-03', N'DCSA-CONV-01'),
        (N'DCSA-VALUE-02', N'DCSA-VALUE-01'),
        (N'DCSA-VALUE-03', N'DCSA-VALUE-02'),
        (N'PSS-DEM-02', N'PSS-DEM-01'),
        (N'PSS-ORCH-02', N'PSS-ORCH-01'),
        (N'PSS-VAL-02', N'PSS-VAL-01'),
        (N'PSS-VAL-03', N'PSS-VAL-02'),
        (N'SMEC-CE-POL-02', N'SMEC-CE-POL-01'),
        (N'SMEC-CE-POL-03', N'SMEC-CE-POL-01'),
        (N'SMEC-CE-NEG-02', N'SMEC-CE-NEG-01'),
        (N'SMEC-CE-NEG-03', N'SMEC-CE-NEG-01'),
        (N'SMEC-CE-ORCH-02', N'SMEC-CE-ORCH-01'),
        (N'SMEC-CE-DEAL2-02', N'SMEC-CE-DEAL2-01'),
        (N'SMEC-CE-DEAL2-03', N'SMEC-CE-DEAL2-02'),
        (N'DCSA-ARCH-02', N'DCSA-ARCH-01'),
        (N'DCSA-ARCH-03', N'DCSA-ARCH-02'),
        (N'DCSA-HEALTH-02', N'DCSA-HEALTH-01'),
        (N'DCSA-EXPAND-02', N'DCSA-EXPAND-01'),
        (N'DCSA-EXPAND-03', N'DCSA-EXPAND-02'),
        (N'DSE-ASSET-02', N'DSE-ASSET-01'),
        (N'DSE-PARTNER-02', N'DSE-PARTNER-01'),
        (N'DSE-PARTNER-03', N'DSE-PARTNER-02'),
        (N'DSS-COMP-02', N'DSS-COMP-01'),
        (N'DSS-COMP-03', N'DSS-COMP-02'),
        (N'DSS-ORCH-02', N'DSS-ORCH-01'),
        (N'DSS-ORCH-03', N'DSS-ORCH-02'),
        (N'PSS-CAP-02', N'PSS-CAP-01'),
        (N'PSS-CAP-03', N'PSS-CAP-02'),
        (N'PSS-CONV-02', N'PSS-CONV-01'),
        (N'PSS-CONV-03', N'PSS-CONV-02'),
        (N'DSS-INV-02', N'DSS-INV-01'),
        (N'DSS-INV-03', N'DSS-INV-02'),
        (N'PSS-INV-02', N'PSS-INV-01'),
        (N'PSS-INV-03', N'PSS-INV-02'),
        (N'DSS-COMP-04', N'DSS-COMP-03'),
        (N'PSS-CAP-04', N'PSS-CAP-02'),
        (N'DCSA-HEALTH-04', N'DCSA-HEALTH-01'),
        (N'SMEC-CE-RENEW-05', N'SMEC-CE-RENEW-01'),
        (N'ALL-CLOSEDWON-02', N'ALL-CLOSEDWON-01'),
        (N'CSAM-ESCALATE-JAI', N'CSAM-ESCALATE-P02')
    ) v([ActivityExternalId], [PrerequisiteExternalId])
)
SELECT @unresolved = 51 - COUNT(*) FROM raw
    INNER JOIN dbo.HuddleActivities AS a ON a.ExternalId = raw.[ActivityExternalId]
    INNER JOIN dbo.HuddleActivities AS pre ON pre.ExternalId = raw.[PrerequisiteExternalId];
IF @unresolved <> 0
    THROW 51000, 'New activity prerequisites: not every reference resolved. Run script 09 first.', 1;

-- Only updates rows this same update introduced in script 09 -- no pre-existing
-- HuddleActivities row is touched.
IF EXISTS (SELECT 1 FROM dbo.HuddleActivities a
    INNER JOIN dbo.HuddleActivities pre ON pre.Id = a.PrerequisiteHuddleActivityId
    INNER JOIN dbo.HuddlePlacements ap ON ap.Id = a.HuddlePlacementId
    INNER JOIN dbo.HuddlePlacements pp ON pp.Id = pre.HuddlePlacementId
    WHERE ap.HuddleTopicId <> pp.HuddleTopicId OR ap.HuddleSegmentRoleId <> pp.HuddleSegmentRoleId)
    THROW 51000, 'A new activity prerequisite crosses a topic or role. Check the workbook.', 1;

COMMIT TRANSACTION;
GO
