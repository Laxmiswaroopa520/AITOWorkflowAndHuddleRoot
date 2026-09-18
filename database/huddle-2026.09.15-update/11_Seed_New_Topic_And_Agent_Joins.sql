SET NOCOUNT ON;
SET XACT_ABORT ON;
DECLARE @unresolved INT;
BEGIN TRANSACTION;

-- Topic to MCEM stage: 0 new pairs
-- no rows

-- Topic to agent
;WITH raw AS (
    SELECT * FROM (VALUES
        (N'WF-X-PIPE-01', N'AGT-013', N'Secondary', NULL, 0, 7),
        (N'WF-X-HEALTH-01', N'AGT-013', N'Secondary', NULL, 0, 6),
        (N'WF-X-DISC-01', N'AGT-013', N'Primary', NULL, 0, 6),
        (N'WF-X-CONV-01', N'AGT-013', N'Secondary', NULL, 0, 6),
        (N'WF-X-PLAN-01', N'AGT-013', N'Primary', NULL, 0, 7),
        (N'WF-X-ARCH-01', N'AGT-013', N'Secondary', NULL, 0, 5),
        (N'WF-INVEST-01', N'AGT-013', N'Secondary', NULL, 0, 3),
        (N'WF-X-RENEW-01', N'AGT-013', N'Primary', NULL, 0, 6),
        (N'WF-X-OPP-01', N'AGT-013', N'Primary', NULL, 0, 5),
        (N'WF-X-POLICY-01', N'AGT-013', N'Primary', NULL, 0, 4),
        (N'WF-X-DEAL-01', N'AGT-013', N'Primary', NULL, 0, 7),
        (N'WF-X-ORCH-01', N'AGT-013', N'Secondary', NULL, 0, 6),
        (N'WF-X-VALUE-01', N'AGT-013', N'Secondary', NULL, 0, 5),
        (N'WF-X-VALUE-01', N'AGT-009', N'Secondary', NULL, 0, 6),
        (N'WF-X-VALUE-01', N'AGT-001', N'Secondary', NULL, 0, 7),
        (N'WF-X-HEALTH-01', N'AGT-009', N'Secondary', NULL, 0, 7),
        (N'WF-X-HEALTH-01', N'AGT-005', N'Secondary', NULL, 0, 8),
        (N'WF-X-RENEW-01', N'AGT-006', N'Secondary', NULL, 0, 7),
        (N'WF-X-ORCH-01', N'AGT-009', N'Secondary', NULL, 0, 7),
        (N'WF-X-PARTNER-01', N'AGT-001', N'Secondary', NULL, 0, 1),
        (N'WF-X-TERRITORY-01', N'AGT-001', N'Primary', NULL, 0, 1),
        (N'WF-X-ORCH-01', N'AGT-005', N'Secondary', NULL, 0, 8),
        (N'WF-X-CONV-01', N'AGT-014', N'Secondary', NULL, 0, 7),
        (N'WF-X-POLICY-01', N'AGT-006', N'Secondary', NULL, 0, 5),
        (N'WF-X-PARTNER-01', N'AGT-004', N'Primary', NULL, 0, 2),
        (N'WF-X-PARTNER-01', N'AGT-009', N'Secondary', NULL, 0, 3),
        (N'WF-X-PARTNER-01', N'AGT-014', N'Secondary', NULL, 0, 4),
        (N'WF-X-PARTNER-01', N'AGT-005', N'Secondary', NULL, 0, 5),
        (N'WF-X-TERRITORY-01', N'AGT-004', N'Secondary', NULL, 0, 2),
        (N'WF-X-TERRITORY-01', N'AGT-013', N'Secondary', NULL, 0, 3),
        (N'WF-X-TERRITORY-01', N'AGT-005', N'Secondary', NULL, 0, 4),
        (N'WF-INVEST-01', N'AGT-006', N'Secondary', NULL, 0, 4),
        (N'WF-INVEST-01', N'AGT-004', N'Secondary', NULL, 0, 5),
        (N'WF-INVEST-01', N'AGT-009', N'Secondary', NULL, 0, 6),
        (N'WF-X-VSAT-01', N'AGT-005', N'Primary', N'Scout', 0, 1),
        (N'WF-X-VSAT-01', N'AGT-003', N'Secondary', N'Microsoft 365 Copilot', 0, 2),
        (N'WF-X-VSAT-01', N'AGT-004', N'Secondary', N'Cowork', 0, 3),
        (N'WF-X-VSAT-01', N'AGT-006', N'Secondary', N'Researcher', 0, 4),
        (N'WF-X-TECHLEAD-01', N'AGT-006', N'Primary', N'Researcher', 0, 1),
        (N'WF-X-TECHLEAD-01', N'AGT-003', N'Secondary', N'Microsoft 365 Copilot', 0, 2),
        (N'WF-X-TECHLEAD-01', N'AGT-004', N'Secondary', N'Cowork', 0, 3),
        (N'WF-X-ARCH-01', N'AGT-015', N'Secondary', N'GitHub Copilot', 0, 6),
        (N'WF-X-ASSET-01', N'AGT-015', N'Secondary', N'GitHub Copilot', 0, 4),
        (N'WF-X-SIGNAL-01', N'AGT-004', N'Primary', N'Cowork', 0, 1),
        (N'WF-X-SIGNAL-01', N'AGT-006', N'Secondary', N'Researcher', 0, 2),
        (N'WF-X-SIGNAL-01', N'AGT-009', N'Secondary', N'Agent J.ai', 0, 3),
        (N'WF-X-SIGNAL-01', N'AGT-005', N'Secondary', N'Scout', 0, 4),
        (N'WF-X-ARCH-01', N'AGT-005', N'Secondary', N'Scout', 0, 7),
        (N'WF-X-DEAL-01', N'AGT-005', N'Secondary', N'Scout', 0, 8),
        (N'WF-X-OPP-01', N'AGT-005', N'Secondary', N'Scout', 0, 6),
        (N'WF-X-PIPE-01', N'AGT-005', N'Secondary', N'Scout', 0, 8),
        (N'WF-X-POLICY-01', N'AGT-005', N'Secondary', N'Scout', 0, 6),
        (N'WF-X-RENEW-01', N'AGT-005', N'Secondary', N'Scout', 0, 8),
        (N'WF-X-VALUE-01', N'AGT-005', N'Secondary', N'Scout', 0, 8),
        (N'WF-X-ARCH-01', N'AGT-002', N'Secondary', N'ECIF Agent', 0, 8),
        (N'WF-X-CONSUME-01', N'AGT-001', N'Primary', N'Sales Agent', 0, 1),
        (N'WF-X-CONSUME-01', N'AGT-004', N'Secondary', N'Cowork', 0, 2),
        (N'WF-X-CONSUME-01', N'AGT-006', N'Secondary', N'Researcher', 0, 3),
        (N'WF-X-CONSUME-01', N'AGT-008', N'Secondary', N'MSXI Assist V2', 0, 4),
        (N'WF-X-DISC-01', N'AGT-002', N'Secondary', N'ECIF Agent', 0, 7),
        (N'WF-X-HEALTH-01', N'AGT-012', N'Secondary', N'Customer Success Agent', 0, 9),
        (N'WF-X-PLAN-01', N'AGT-002', N'Secondary', N'ECIF Agent', 0, 8),
        (N'WF-X-RENEW-01', N'AGT-007', N'Secondary', N'Analyst', 0, 9),
        (N'WF-X-VALUE-01', N'AGT-007', N'Secondary', N'Analyst', 0, 9),
        (N'WF-X-PARTNER-01', N'AGT-013', N'Secondary', NULL, 0, 6)
    ) v([TopicExternalId], [AgentExternalId], [UsageType], [DisplayLabel], [ShowAgentAccessLink], [DisplayOrder])
), src AS (
    SELECT raw.*, t.Id AS [HuddleTopicId], ag.Id AS [HuddleAgentId]
    FROM raw
    INNER JOIN dbo.HuddleTopics AS t ON t.[ExternalId] = raw.[TopicExternalId]
    INNER JOIN dbo.HuddleAgents AS ag ON ag.[ExternalId] = raw.[AgentExternalId]
)
MERGE dbo.HuddleTopicAgents AS tgt
USING src ON tgt.[HuddleTopicId] = src.[HuddleTopicId] AND tgt.[HuddleAgentId] = src.[HuddleAgentId] AND tgt.[UsageType] = src.[UsageType]
WHEN MATCHED THEN UPDATE SET
        tgt.[DisplayLabel] = src.[DisplayLabel],
        tgt.[ShowAgentAccessLink] = src.[ShowAgentAccessLink],
        tgt.[DisplayOrder] = src.[DisplayOrder]
WHEN NOT MATCHED BY TARGET THEN INSERT ([HuddleTopicId], [HuddleAgentId], [UsageType], [DisplayLabel], [ShowAgentAccessLink], [DisplayOrder])
    VALUES (src.[HuddleTopicId], src.[HuddleAgentId], src.[UsageType], src.[DisplayLabel], src.[ShowAgentAccessLink], src.[DisplayOrder]);
;WITH raw AS (
    SELECT * FROM (VALUES
        (N'WF-X-PIPE-01', N'AGT-013', N'Secondary', NULL, 0, 7),
        (N'WF-X-HEALTH-01', N'AGT-013', N'Secondary', NULL, 0, 6),
        (N'WF-X-DISC-01', N'AGT-013', N'Primary', NULL, 0, 6),
        (N'WF-X-CONV-01', N'AGT-013', N'Secondary', NULL, 0, 6),
        (N'WF-X-PLAN-01', N'AGT-013', N'Primary', NULL, 0, 7),
        (N'WF-X-ARCH-01', N'AGT-013', N'Secondary', NULL, 0, 5),
        (N'WF-INVEST-01', N'AGT-013', N'Secondary', NULL, 0, 3),
        (N'WF-X-RENEW-01', N'AGT-013', N'Primary', NULL, 0, 6),
        (N'WF-X-OPP-01', N'AGT-013', N'Primary', NULL, 0, 5),
        (N'WF-X-POLICY-01', N'AGT-013', N'Primary', NULL, 0, 4),
        (N'WF-X-DEAL-01', N'AGT-013', N'Primary', NULL, 0, 7),
        (N'WF-X-ORCH-01', N'AGT-013', N'Secondary', NULL, 0, 6),
        (N'WF-X-VALUE-01', N'AGT-013', N'Secondary', NULL, 0, 5),
        (N'WF-X-VALUE-01', N'AGT-009', N'Secondary', NULL, 0, 6),
        (N'WF-X-VALUE-01', N'AGT-001', N'Secondary', NULL, 0, 7),
        (N'WF-X-HEALTH-01', N'AGT-009', N'Secondary', NULL, 0, 7),
        (N'WF-X-HEALTH-01', N'AGT-005', N'Secondary', NULL, 0, 8),
        (N'WF-X-RENEW-01', N'AGT-006', N'Secondary', NULL, 0, 7),
        (N'WF-X-ORCH-01', N'AGT-009', N'Secondary', NULL, 0, 7),
        (N'WF-X-PARTNER-01', N'AGT-001', N'Secondary', NULL, 0, 1),
        (N'WF-X-TERRITORY-01', N'AGT-001', N'Primary', NULL, 0, 1),
        (N'WF-X-ORCH-01', N'AGT-005', N'Secondary', NULL, 0, 8),
        (N'WF-X-CONV-01', N'AGT-014', N'Secondary', NULL, 0, 7),
        (N'WF-X-POLICY-01', N'AGT-006', N'Secondary', NULL, 0, 5),
        (N'WF-X-PARTNER-01', N'AGT-004', N'Primary', NULL, 0, 2),
        (N'WF-X-PARTNER-01', N'AGT-009', N'Secondary', NULL, 0, 3),
        (N'WF-X-PARTNER-01', N'AGT-014', N'Secondary', NULL, 0, 4),
        (N'WF-X-PARTNER-01', N'AGT-005', N'Secondary', NULL, 0, 5),
        (N'WF-X-TERRITORY-01', N'AGT-004', N'Secondary', NULL, 0, 2),
        (N'WF-X-TERRITORY-01', N'AGT-013', N'Secondary', NULL, 0, 3),
        (N'WF-X-TERRITORY-01', N'AGT-005', N'Secondary', NULL, 0, 4),
        (N'WF-INVEST-01', N'AGT-006', N'Secondary', NULL, 0, 4),
        (N'WF-INVEST-01', N'AGT-004', N'Secondary', NULL, 0, 5),
        (N'WF-INVEST-01', N'AGT-009', N'Secondary', NULL, 0, 6),
        (N'WF-X-VSAT-01', N'AGT-005', N'Primary', N'Scout', 0, 1),
        (N'WF-X-VSAT-01', N'AGT-003', N'Secondary', N'Microsoft 365 Copilot', 0, 2),
        (N'WF-X-VSAT-01', N'AGT-004', N'Secondary', N'Cowork', 0, 3),
        (N'WF-X-VSAT-01', N'AGT-006', N'Secondary', N'Researcher', 0, 4),
        (N'WF-X-TECHLEAD-01', N'AGT-006', N'Primary', N'Researcher', 0, 1),
        (N'WF-X-TECHLEAD-01', N'AGT-003', N'Secondary', N'Microsoft 365 Copilot', 0, 2),
        (N'WF-X-TECHLEAD-01', N'AGT-004', N'Secondary', N'Cowork', 0, 3),
        (N'WF-X-ARCH-01', N'AGT-015', N'Secondary', N'GitHub Copilot', 0, 6),
        (N'WF-X-ASSET-01', N'AGT-015', N'Secondary', N'GitHub Copilot', 0, 4),
        (N'WF-X-SIGNAL-01', N'AGT-004', N'Primary', N'Cowork', 0, 1),
        (N'WF-X-SIGNAL-01', N'AGT-006', N'Secondary', N'Researcher', 0, 2),
        (N'WF-X-SIGNAL-01', N'AGT-009', N'Secondary', N'Agent J.ai', 0, 3),
        (N'WF-X-SIGNAL-01', N'AGT-005', N'Secondary', N'Scout', 0, 4),
        (N'WF-X-ARCH-01', N'AGT-005', N'Secondary', N'Scout', 0, 7),
        (N'WF-X-DEAL-01', N'AGT-005', N'Secondary', N'Scout', 0, 8),
        (N'WF-X-OPP-01', N'AGT-005', N'Secondary', N'Scout', 0, 6),
        (N'WF-X-PIPE-01', N'AGT-005', N'Secondary', N'Scout', 0, 8),
        (N'WF-X-POLICY-01', N'AGT-005', N'Secondary', N'Scout', 0, 6),
        (N'WF-X-RENEW-01', N'AGT-005', N'Secondary', N'Scout', 0, 8),
        (N'WF-X-VALUE-01', N'AGT-005', N'Secondary', N'Scout', 0, 8),
        (N'WF-X-ARCH-01', N'AGT-002', N'Secondary', N'ECIF Agent', 0, 8),
        (N'WF-X-CONSUME-01', N'AGT-001', N'Primary', N'Sales Agent', 0, 1),
        (N'WF-X-CONSUME-01', N'AGT-004', N'Secondary', N'Cowork', 0, 2),
        (N'WF-X-CONSUME-01', N'AGT-006', N'Secondary', N'Researcher', 0, 3),
        (N'WF-X-CONSUME-01', N'AGT-008', N'Secondary', N'MSXI Assist V2', 0, 4),
        (N'WF-X-DISC-01', N'AGT-002', N'Secondary', N'ECIF Agent', 0, 7),
        (N'WF-X-HEALTH-01', N'AGT-012', N'Secondary', N'Customer Success Agent', 0, 9),
        (N'WF-X-PLAN-01', N'AGT-002', N'Secondary', N'ECIF Agent', 0, 8),
        (N'WF-X-RENEW-01', N'AGT-007', N'Secondary', N'Analyst', 0, 9),
        (N'WF-X-VALUE-01', N'AGT-007', N'Secondary', N'Analyst', 0, 9),
        (N'WF-X-PARTNER-01', N'AGT-013', N'Secondary', NULL, 0, 6)
    ) v([TopicExternalId], [AgentExternalId], [UsageType], [DisplayLabel], [ShowAgentAccessLink], [DisplayOrder])
)
SELECT @unresolved = 65 - COUNT(*) FROM raw
    INNER JOIN dbo.HuddleTopics AS t ON t.[ExternalId] = raw.[TopicExternalId]
    INNER JOIN dbo.HuddleAgents AS ag ON ag.[ExternalId] = raw.[AgentExternalId];
IF @unresolved <> 0
    THROW 51000, 'HuddleTopicAgents (new): 65 source rows were expected to resolve their foreign keys but some did not. Run the earlier scripts in order and re-check the workbook.', 1;

-- Topic to resource: 0 new pairs
-- no rows

-- Agent to resource
;WITH raw AS (
    SELECT * FROM (VALUES
        (N'AGT-008', N'RES-007', 1),
        (N'AGT-013', N'RES-SALESHOME', 1),
        (N'AGT-014', N'RES-KYP', 1),
        (N'AGT-013', N'RES-GLOBAL-01', 2),
        (N'AGT-014', N'RES-GLOBAL-01', 2)
    ) v([AgentExternalId], [ResourceExternalId], [DisplayOrder])
), src AS (
    SELECT raw.*, ag.Id AS [HuddleAgentId], rs.Id AS [HuddleResourceId]
    FROM raw
    INNER JOIN dbo.HuddleAgents AS ag ON ag.[ExternalId] = raw.[AgentExternalId]
    INNER JOIN dbo.HuddleResources AS rs ON rs.[ExternalId] = raw.[ResourceExternalId]
)
MERGE dbo.HuddleAgentResources AS tgt
USING src ON tgt.[HuddleAgentId] = src.[HuddleAgentId] AND tgt.[HuddleResourceId] = src.[HuddleResourceId]
WHEN MATCHED THEN UPDATE SET
        tgt.[DisplayOrder] = src.[DisplayOrder]
WHEN NOT MATCHED BY TARGET THEN INSERT ([HuddleAgentId], [HuddleResourceId], [DisplayOrder])
    VALUES (src.[HuddleAgentId], src.[HuddleResourceId], src.[DisplayOrder]);
;WITH raw AS (
    SELECT * FROM (VALUES
        (N'AGT-008', N'RES-007', 1),
        (N'AGT-013', N'RES-SALESHOME', 1),
        (N'AGT-014', N'RES-KYP', 1),
        (N'AGT-013', N'RES-GLOBAL-01', 2),
        (N'AGT-014', N'RES-GLOBAL-01', 2)
    ) v([AgentExternalId], [ResourceExternalId], [DisplayOrder])
)
SELECT @unresolved = 5 - COUNT(*) FROM raw
    INNER JOIN dbo.HuddleAgents AS ag ON ag.[ExternalId] = raw.[AgentExternalId]
    INNER JOIN dbo.HuddleResources AS rs ON rs.[ExternalId] = raw.[ResourceExternalId];
IF @unresolved <> 0
    THROW 51000, 'HuddleAgentResources (new): 5 source rows were expected to resolve their foreign keys but some did not. Run the earlier scripts in order and re-check the workbook.', 1;

COMMIT TRANSACTION;
GO
