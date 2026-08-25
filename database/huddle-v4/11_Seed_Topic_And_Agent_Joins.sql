/*
    Topic to MCEM stage, topic to agent, topic to resource, agent to resource
    Generated from the Frontier Accelerator content workbook by generate.py.
    Do not hand-edit. Re-runnable: every statement is an ExternalId-keyed MERGE, nothing is deleted.
*/
SET NOCOUNT ON;
SET XACT_ABORT ON;
DECLARE @unresolved INT;
BEGIN TRANSACTION;

-- Topic to MCEM stage, ordered by MCEM stage number
;WITH raw AS (
    SELECT * FROM (VALUES
        (N'WF-X-ARCH-01', N'MCEM-02', 1),
        (N'WF-X-ARCH-01', N'MCEM-03', 2),
        (N'WF-X-ASSET-01', N'MCEM-03', 1),
        (N'WF-X-CONV-01', N'MCEM-01', 1),
        (N'WF-X-CONV-01', N'MCEM-02', 2),
        (N'WF-X-CONV-01', N'MCEM-03', 3),
        (N'WF-X-DEAL-01', N'MCEM-02', 1),
        (N'WF-X-DEAL-01', N'MCEM-03', 2),
        (N'WF-X-DISC-01', N'MCEM-03', 1),
        (N'WF-X-HEALTH-01', N'MCEM-04', 1),
        (N'WF-X-HEALTH-01', N'MCEM-05', 2),
        (N'WF-X-OPP-01', N'MCEM-01', 1),
        (N'WF-X-OPP-01', N'MCEM-05', 2),
        (N'WF-X-ORCH-01', N'MCEM-01', 1),
        (N'WF-X-ORCH-01', N'MCEM-02', 2),
        (N'WF-X-ORCH-01', N'MCEM-04', 3),
        (N'WF-X-PIPE-01', N'MCEM-04', 1),
        (N'WF-X-PIPE-01', N'MCEM-05', 2),
        (N'WF-X-PLAN-01', N'MCEM-02', 1),
        (N'WF-X-PLAN-01', N'MCEM-05', 2),
        (N'WF-X-POLICY-01', N'MCEM-03', 1),
        (N'WF-X-RENEW-01', N'MCEM-04', 1),
        (N'WF-X-VALUE-01', N'MCEM-02', 1)
    ) v([TopicExternalId], [McemExternalId], [DisplayOrder])
), src AS (
    SELECT raw.*, t.Id AS [HuddleTopicId], mc.Id AS [HuddleMcemStageId]
    FROM raw
    INNER JOIN dbo.HuddleTopics AS t ON t.[ExternalId] = raw.[TopicExternalId]
    INNER JOIN dbo.HuddleMcemStages AS mc ON mc.[ExternalId] = raw.[McemExternalId]
)
MERGE dbo.HuddleTopicMcemStages AS tgt
USING src ON tgt.[HuddleTopicId] = src.[HuddleTopicId] AND tgt.[HuddleMcemStageId] = src.[HuddleMcemStageId]
WHEN MATCHED THEN UPDATE SET
        tgt.[DisplayOrder] = src.[DisplayOrder]
WHEN NOT MATCHED BY TARGET THEN INSERT ([HuddleTopicId], [HuddleMcemStageId], [DisplayOrder])
    VALUES (src.[HuddleTopicId], src.[HuddleMcemStageId], src.[DisplayOrder]);
;WITH raw AS (
    SELECT * FROM (VALUES
        (N'WF-X-ARCH-01', N'MCEM-02', 1),
        (N'WF-X-ARCH-01', N'MCEM-03', 2),
        (N'WF-X-ASSET-01', N'MCEM-03', 1),
        (N'WF-X-CONV-01', N'MCEM-01', 1),
        (N'WF-X-CONV-01', N'MCEM-02', 2),
        (N'WF-X-CONV-01', N'MCEM-03', 3),
        (N'WF-X-DEAL-01', N'MCEM-02', 1),
        (N'WF-X-DEAL-01', N'MCEM-03', 2),
        (N'WF-X-DISC-01', N'MCEM-03', 1),
        (N'WF-X-HEALTH-01', N'MCEM-04', 1),
        (N'WF-X-HEALTH-01', N'MCEM-05', 2),
        (N'WF-X-OPP-01', N'MCEM-01', 1),
        (N'WF-X-OPP-01', N'MCEM-05', 2),
        (N'WF-X-ORCH-01', N'MCEM-01', 1),
        (N'WF-X-ORCH-01', N'MCEM-02', 2),
        (N'WF-X-ORCH-01', N'MCEM-04', 3),
        (N'WF-X-PIPE-01', N'MCEM-04', 1),
        (N'WF-X-PIPE-01', N'MCEM-05', 2),
        (N'WF-X-PLAN-01', N'MCEM-02', 1),
        (N'WF-X-PLAN-01', N'MCEM-05', 2),
        (N'WF-X-POLICY-01', N'MCEM-03', 1),
        (N'WF-X-RENEW-01', N'MCEM-04', 1),
        (N'WF-X-VALUE-01', N'MCEM-02', 1)
    ) v([TopicExternalId], [McemExternalId], [DisplayOrder])
)
SELECT @unresolved = 23 - COUNT(*) FROM raw
    INNER JOIN dbo.HuddleTopics AS t ON t.[ExternalId] = raw.[TopicExternalId]
    INNER JOIN dbo.HuddleMcemStages AS mc ON mc.[ExternalId] = raw.[McemExternalId];
IF @unresolved <> 0
    THROW 51000, 'HuddleTopicMcemStages: 23 source rows were expected to resolve their foreign keys but some did not. Run the earlier scripts in order and re-check the workbook.', 1;

-- Topic to agent
;WITH raw AS (
    SELECT * FROM (VALUES
        (N'WF-INVEST-01', N'AGT-002', N'Primary', N'ECIF Agent', 0, 1),
        (N'WF-INVEST-01', N'AGT-001', N'Secondary', N'Sales Agent', 0, 2),
        (N'WF-X-ARCH-01', N'AGT-004', N'Primary', N'Cowork', 0, 1),
        (N'WF-X-ARCH-01', N'AGT-006', N'Secondary', N'Researcher', 0, 2),
        (N'WF-X-ARCH-01', N'AGT-001', N'Secondary', N'Sales Agent', 0, 3),
        (N'WF-X-ARCH-01', N'AGT-003', N'Secondary', N'Microsoft 365 Copilot', 0, 4),
        (N'WF-X-ASSET-01', N'AGT-004', N'Primary', N'Cowork', 0, 1),
        (N'WF-X-ASSET-01', N'AGT-005', N'Secondary', N'Scout', 0, 2),
        (N'WF-X-ASSET-01', N'AGT-006', N'Secondary', N'Researcher', 0, 3),
        (N'WF-X-CONV-01', N'AGT-004', N'Primary', N'Cowork', 0, 1),
        (N'WF-X-CONV-01', N'AGT-006', N'Secondary', N'Researcher', 0, 2),
        (N'WF-X-CONV-01', N'AGT-003', N'Secondary', N'Microsoft 365 Copilot', 0, 3),
        (N'WF-X-CONV-01', N'AGT-009', N'Secondary', N'Agent J.ai', 0, 4),
        (N'WF-X-CONV-01', N'AGT-001', N'Secondary', N'Sales Agent', 0, 5),
        (N'WF-X-DEAL-01', N'AGT-001', N'Primary', N'Sales Agent', 0, 1),
        (N'WF-X-DEAL-01', N'AGT-003', N'Secondary', N'Microsoft 365 Copilot', 0, 2),
        (N'WF-X-DEAL-01', N'AGT-006', N'Secondary', N'Researcher', 0, 3),
        (N'WF-X-DEAL-01', N'AGT-004', N'Secondary', N'Cowork', 0, 4),
        (N'WF-X-DEAL-01', N'AGT-008', N'Secondary', N'MSXI Assist V2', 0, 5),
        (N'WF-X-DEAL-01', N'AGT-009', N'Secondary', N'Agent J.ai', 0, 6),
        (N'WF-X-DISC-01', N'AGT-001', N'Primary', N'Sales Agent', 0, 1),
        (N'WF-X-DISC-01', N'AGT-003', N'Secondary', N'Microsoft 365 Copilot', 0, 2),
        (N'WF-X-DISC-01', N'AGT-004', N'Secondary', N'Cowork', 0, 3),
        (N'WF-X-DISC-01', N'AGT-006', N'Secondary', N'Researcher', 0, 4),
        (N'WF-X-DISC-01', N'AGT-009', N'Secondary', N'Agent J.ai', 0, 5),
        (N'WF-X-HEALTH-01', N'AGT-003', N'Primary', N'Microsoft 365 Copilot', 0, 1),
        (N'WF-X-HEALTH-01', N'AGT-008', N'Secondary', N'MSXI Assist V2', 0, 2),
        (N'WF-X-HEALTH-01', N'AGT-001', N'Secondary', N'Sales Agent', 0, 3),
        (N'WF-X-HEALTH-01', N'AGT-004', N'Secondary', N'Cowork', 0, 4),
        (N'WF-X-HEALTH-01', N'AGT-006', N'Secondary', N'Researcher', 0, 5),
        (N'WF-X-OPP-01', N'AGT-001', N'Primary', N'Sales Agent', 0, 1),
        (N'WF-X-OPP-01', N'AGT-004', N'Secondary', N'Cowork', 0, 2),
        (N'WF-X-OPP-01', N'AGT-003', N'Secondary', N'Microsoft 365 Copilot', 0, 3),
        (N'WF-X-OPP-01', N'AGT-006', N'Secondary', N'Researcher', 0, 4),
        (N'WF-X-ORCH-01', N'AGT-003', N'Primary', N'Microsoft 365 Copilot', 0, 1),
        (N'WF-X-ORCH-01', N'AGT-004', N'Secondary', N'Cowork', 0, 2),
        (N'WF-X-ORCH-01', N'AGT-002', N'Secondary', N'ECIF Agent', 0, 3),
        (N'WF-X-ORCH-01', N'AGT-001', N'Secondary', N'Sales Agent', 0, 4),
        (N'WF-X-ORCH-01', N'AGT-006', N'Secondary', N'Researcher', 0, 5),
        (N'WF-X-PIPE-01', N'AGT-008', N'Primary', N'MSXI Assist V2', 0, 1),
        (N'WF-X-PIPE-01', N'AGT-001', N'Secondary', N'Sales Agent', 0, 2),
        (N'WF-X-PIPE-01', N'AGT-003', N'Secondary', N'Microsoft 365 Copilot', 0, 3),
        (N'WF-X-PIPE-01', N'AGT-004', N'Secondary', N'Cowork', 0, 4),
        (N'WF-X-PIPE-01', N'AGT-006', N'Secondary', N'Researcher', 0, 5),
        (N'WF-X-PIPE-01', N'AGT-010', N'Secondary', N'Auto-Fix Pipeline Agent', 0, 6),
        (N'WF-X-PLAN-01', N'AGT-001', N'Primary', N'Sales Agent', 0, 1),
        (N'WF-X-PLAN-01', N'AGT-004', N'Secondary', N'Cowork', 0, 2),
        (N'WF-X-PLAN-01', N'AGT-006', N'Secondary', N'Researcher', 0, 3),
        (N'WF-X-PLAN-01', N'AGT-008', N'Secondary', N'MSXI Assist V2', 0, 4),
        (N'WF-X-PLAN-01', N'AGT-003', N'Secondary', N'Microsoft 365 Copilot', 0, 5),
        (N'WF-X-PLAN-01', N'AGT-005', N'Secondary', N'Scout', 0, 6),
        (N'WF-X-POLICY-01', N'AGT-001', N'Primary', N'Sales Agent', 0, 1),
        (N'WF-X-POLICY-01', N'AGT-003', N'Secondary', N'Microsoft 365 Copilot', 0, 2),
        (N'WF-X-POLICY-01', N'AGT-004', N'Secondary', N'Cowork', 0, 3),
        (N'WF-X-RENEW-01', N'AGT-001', N'Primary', N'Sales Agent', 0, 1),
        (N'WF-X-RENEW-01', N'AGT-003', N'Secondary', N'Microsoft 365 Copilot', 0, 2),
        (N'WF-X-RENEW-01', N'AGT-004', N'Secondary', N'Cowork', 0, 3),
        (N'WF-X-RENEW-01', N'AGT-008', N'Secondary', N'MSXI Assist V2', 0, 4),
        (N'WF-X-RENEW-01', N'AGT-009', N'Secondary', N'Agent J.ai', 0, 5),
        (N'WF-X-VALUE-01', N'AGT-004', N'Primary', N'Cowork', 0, 1),
        (N'WF-X-VALUE-01', N'AGT-003', N'Secondary', N'Microsoft 365 Copilot', 0, 2),
        (N'WF-X-VALUE-01', N'AGT-006', N'Secondary', N'Researcher', 0, 3),
        (N'WF-X-VALUE-01', N'AGT-008', N'Secondary', N'MSXI Assist V2', 0, 4)
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
        (N'WF-INVEST-01', N'AGT-002', N'Primary', N'ECIF Agent', 0, 1),
        (N'WF-INVEST-01', N'AGT-001', N'Secondary', N'Sales Agent', 0, 2),
        (N'WF-X-ARCH-01', N'AGT-004', N'Primary', N'Cowork', 0, 1),
        (N'WF-X-ARCH-01', N'AGT-006', N'Secondary', N'Researcher', 0, 2),
        (N'WF-X-ARCH-01', N'AGT-001', N'Secondary', N'Sales Agent', 0, 3),
        (N'WF-X-ARCH-01', N'AGT-003', N'Secondary', N'Microsoft 365 Copilot', 0, 4),
        (N'WF-X-ASSET-01', N'AGT-004', N'Primary', N'Cowork', 0, 1),
        (N'WF-X-ASSET-01', N'AGT-005', N'Secondary', N'Scout', 0, 2),
        (N'WF-X-ASSET-01', N'AGT-006', N'Secondary', N'Researcher', 0, 3),
        (N'WF-X-CONV-01', N'AGT-004', N'Primary', N'Cowork', 0, 1),
        (N'WF-X-CONV-01', N'AGT-006', N'Secondary', N'Researcher', 0, 2),
        (N'WF-X-CONV-01', N'AGT-003', N'Secondary', N'Microsoft 365 Copilot', 0, 3),
        (N'WF-X-CONV-01', N'AGT-009', N'Secondary', N'Agent J.ai', 0, 4),
        (N'WF-X-CONV-01', N'AGT-001', N'Secondary', N'Sales Agent', 0, 5),
        (N'WF-X-DEAL-01', N'AGT-001', N'Primary', N'Sales Agent', 0, 1),
        (N'WF-X-DEAL-01', N'AGT-003', N'Secondary', N'Microsoft 365 Copilot', 0, 2),
        (N'WF-X-DEAL-01', N'AGT-006', N'Secondary', N'Researcher', 0, 3),
        (N'WF-X-DEAL-01', N'AGT-004', N'Secondary', N'Cowork', 0, 4),
        (N'WF-X-DEAL-01', N'AGT-008', N'Secondary', N'MSXI Assist V2', 0, 5),
        (N'WF-X-DEAL-01', N'AGT-009', N'Secondary', N'Agent J.ai', 0, 6),
        (N'WF-X-DISC-01', N'AGT-001', N'Primary', N'Sales Agent', 0, 1),
        (N'WF-X-DISC-01', N'AGT-003', N'Secondary', N'Microsoft 365 Copilot', 0, 2),
        (N'WF-X-DISC-01', N'AGT-004', N'Secondary', N'Cowork', 0, 3),
        (N'WF-X-DISC-01', N'AGT-006', N'Secondary', N'Researcher', 0, 4),
        (N'WF-X-DISC-01', N'AGT-009', N'Secondary', N'Agent J.ai', 0, 5),
        (N'WF-X-HEALTH-01', N'AGT-003', N'Primary', N'Microsoft 365 Copilot', 0, 1),
        (N'WF-X-HEALTH-01', N'AGT-008', N'Secondary', N'MSXI Assist V2', 0, 2),
        (N'WF-X-HEALTH-01', N'AGT-001', N'Secondary', N'Sales Agent', 0, 3),
        (N'WF-X-HEALTH-01', N'AGT-004', N'Secondary', N'Cowork', 0, 4),
        (N'WF-X-HEALTH-01', N'AGT-006', N'Secondary', N'Researcher', 0, 5),
        (N'WF-X-OPP-01', N'AGT-001', N'Primary', N'Sales Agent', 0, 1),
        (N'WF-X-OPP-01', N'AGT-004', N'Secondary', N'Cowork', 0, 2),
        (N'WF-X-OPP-01', N'AGT-003', N'Secondary', N'Microsoft 365 Copilot', 0, 3),
        (N'WF-X-OPP-01', N'AGT-006', N'Secondary', N'Researcher', 0, 4),
        (N'WF-X-ORCH-01', N'AGT-003', N'Primary', N'Microsoft 365 Copilot', 0, 1),
        (N'WF-X-ORCH-01', N'AGT-004', N'Secondary', N'Cowork', 0, 2),
        (N'WF-X-ORCH-01', N'AGT-002', N'Secondary', N'ECIF Agent', 0, 3),
        (N'WF-X-ORCH-01', N'AGT-001', N'Secondary', N'Sales Agent', 0, 4),
        (N'WF-X-ORCH-01', N'AGT-006', N'Secondary', N'Researcher', 0, 5),
        (N'WF-X-PIPE-01', N'AGT-008', N'Primary', N'MSXI Assist V2', 0, 1),
        (N'WF-X-PIPE-01', N'AGT-001', N'Secondary', N'Sales Agent', 0, 2),
        (N'WF-X-PIPE-01', N'AGT-003', N'Secondary', N'Microsoft 365 Copilot', 0, 3),
        (N'WF-X-PIPE-01', N'AGT-004', N'Secondary', N'Cowork', 0, 4),
        (N'WF-X-PIPE-01', N'AGT-006', N'Secondary', N'Researcher', 0, 5),
        (N'WF-X-PIPE-01', N'AGT-010', N'Secondary', N'Auto-Fix Pipeline Agent', 0, 6),
        (N'WF-X-PLAN-01', N'AGT-001', N'Primary', N'Sales Agent', 0, 1),
        (N'WF-X-PLAN-01', N'AGT-004', N'Secondary', N'Cowork', 0, 2),
        (N'WF-X-PLAN-01', N'AGT-006', N'Secondary', N'Researcher', 0, 3),
        (N'WF-X-PLAN-01', N'AGT-008', N'Secondary', N'MSXI Assist V2', 0, 4),
        (N'WF-X-PLAN-01', N'AGT-003', N'Secondary', N'Microsoft 365 Copilot', 0, 5),
        (N'WF-X-PLAN-01', N'AGT-005', N'Secondary', N'Scout', 0, 6),
        (N'WF-X-POLICY-01', N'AGT-001', N'Primary', N'Sales Agent', 0, 1),
        (N'WF-X-POLICY-01', N'AGT-003', N'Secondary', N'Microsoft 365 Copilot', 0, 2),
        (N'WF-X-POLICY-01', N'AGT-004', N'Secondary', N'Cowork', 0, 3),
        (N'WF-X-RENEW-01', N'AGT-001', N'Primary', N'Sales Agent', 0, 1),
        (N'WF-X-RENEW-01', N'AGT-003', N'Secondary', N'Microsoft 365 Copilot', 0, 2),
        (N'WF-X-RENEW-01', N'AGT-004', N'Secondary', N'Cowork', 0, 3),
        (N'WF-X-RENEW-01', N'AGT-008', N'Secondary', N'MSXI Assist V2', 0, 4),
        (N'WF-X-RENEW-01', N'AGT-009', N'Secondary', N'Agent J.ai', 0, 5),
        (N'WF-X-VALUE-01', N'AGT-004', N'Primary', N'Cowork', 0, 1),
        (N'WF-X-VALUE-01', N'AGT-003', N'Secondary', N'Microsoft 365 Copilot', 0, 2),
        (N'WF-X-VALUE-01', N'AGT-006', N'Secondary', N'Researcher', 0, 3),
        (N'WF-X-VALUE-01', N'AGT-008', N'Secondary', N'MSXI Assist V2', 0, 4)
    ) v([TopicExternalId], [AgentExternalId], [UsageType], [DisplayLabel], [ShowAgentAccessLink], [DisplayOrder])
)
SELECT @unresolved = 63 - COUNT(*) FROM raw
    INNER JOIN dbo.HuddleTopics AS t ON t.[ExternalId] = raw.[TopicExternalId]
    INNER JOIN dbo.HuddleAgents AS ag ON ag.[ExternalId] = raw.[AgentExternalId];
IF @unresolved <> 0
    THROW 51000, 'HuddleTopicAgents: 63 source rows were expected to resolve their foreign keys but some did not. Run the earlier scripts in order and re-check the workbook.', 1;

-- Topic to resource
;WITH raw AS (
    SELECT * FROM (VALUES
        (N'WF-X-ARCH-01', N'RES-001', 1),
        (N'WF-X-ARCH-01', N'RES-003', 2),
        (N'WF-X-ASSET-01', N'RES-003', 1),
        (N'WF-X-CONV-01', N'RES-001', 1),
        (N'WF-X-CONV-01', N'RES-003', 2),
        (N'WF-X-DEAL-01', N'RES-001', 1),
        (N'WF-X-HEALTH-01', N'RES-001', 2),
        (N'WF-X-OPP-01', N'RES-001', 2),
        (N'WF-X-OPP-01', N'RES-003', 1),
        (N'WF-X-ORCH-01', N'RES-001', 2),
        (N'WF-X-ORCH-01', N'RES-003', 1),
        (N'WF-X-PIPE-01', N'RES-001', 2),
        (N'WF-X-PLAN-01', N'RES-001', 1),
        (N'WF-X-PLAN-01', N'RES-003', 2),
        (N'WF-X-POLICY-01', N'RES-001', 2),
        (N'WF-X-POLICY-01', N'RES-003', 1),
        (N'WF-X-RENEW-01', N'RES-001', 1),
        (N'WF-X-DEAL-01', N'RES-DA-01', 2),
        (N'WF-X-DEAL-01', N'RES-DA-05', 3)
    ) v([TopicExternalId], [ResourceExternalId], [DisplayOrder])
), src AS (
    SELECT raw.*, t.Id AS [HuddleTopicId], rs.Id AS [HuddleResourceId]
    FROM raw
    INNER JOIN dbo.HuddleTopics AS t ON t.[ExternalId] = raw.[TopicExternalId]
    INNER JOIN dbo.HuddleResources AS rs ON rs.[ExternalId] = raw.[ResourceExternalId]
)
MERGE dbo.HuddleTopicResources AS tgt
USING src ON tgt.[HuddleTopicId] = src.[HuddleTopicId] AND tgt.[HuddleResourceId] = src.[HuddleResourceId]
WHEN MATCHED THEN UPDATE SET
        tgt.[DisplayOrder] = src.[DisplayOrder]
WHEN NOT MATCHED BY TARGET THEN INSERT ([HuddleTopicId], [HuddleResourceId], [DisplayOrder])
    VALUES (src.[HuddleTopicId], src.[HuddleResourceId], src.[DisplayOrder]);
;WITH raw AS (
    SELECT * FROM (VALUES
        (N'WF-X-ARCH-01', N'RES-001', 1),
        (N'WF-X-ARCH-01', N'RES-003', 2),
        (N'WF-X-ASSET-01', N'RES-003', 1),
        (N'WF-X-CONV-01', N'RES-001', 1),
        (N'WF-X-CONV-01', N'RES-003', 2),
        (N'WF-X-DEAL-01', N'RES-001', 1),
        (N'WF-X-HEALTH-01', N'RES-001', 2),
        (N'WF-X-OPP-01', N'RES-001', 2),
        (N'WF-X-OPP-01', N'RES-003', 1),
        (N'WF-X-ORCH-01', N'RES-001', 2),
        (N'WF-X-ORCH-01', N'RES-003', 1),
        (N'WF-X-PIPE-01', N'RES-001', 2),
        (N'WF-X-PLAN-01', N'RES-001', 1),
        (N'WF-X-PLAN-01', N'RES-003', 2),
        (N'WF-X-POLICY-01', N'RES-001', 2),
        (N'WF-X-POLICY-01', N'RES-003', 1),
        (N'WF-X-RENEW-01', N'RES-001', 1),
        (N'WF-X-DEAL-01', N'RES-DA-01', 2),
        (N'WF-X-DEAL-01', N'RES-DA-05', 3)
    ) v([TopicExternalId], [ResourceExternalId], [DisplayOrder])
)
SELECT @unresolved = 19 - COUNT(*) FROM raw
    INNER JOIN dbo.HuddleTopics AS t ON t.[ExternalId] = raw.[TopicExternalId]
    INNER JOIN dbo.HuddleResources AS rs ON rs.[ExternalId] = raw.[ResourceExternalId];
IF @unresolved <> 0
    THROW 51000, 'HuddleTopicResources: 19 source rows were expected to resolve their foreign keys but some did not. Run the earlier scripts in order and re-check the workbook.', 1;

-- Agent to resource
;WITH raw AS (
    SELECT * FROM (VALUES
        (N'AGT-001', N'RES-001', 1),
        (N'AGT-001', N'RES-002', 2),
        (N'AGT-004', N'RES-003', 1),
        (N'AGT-006', N'RES-004', 1),
        (N'AGT-009', N'RES-006', 1),
        (N'AGT-011', N'RES-007', 1),
        (N'AGT-002', N'RES-008', 1),
        (N'AGT-001', N'RES-GLOBAL-01', 3),
        (N'AGT-002', N'RES-GLOBAL-01', 2),
        (N'AGT-003', N'RES-GLOBAL-01', 1),
        (N'AGT-004', N'RES-GLOBAL-01', 2),
        (N'AGT-011', N'RES-CSAM-PERSONA', 2),
        (N'AGT-012', N'RES-CSAM-HEALTH', 1),
        (N'AGT-001', N'RES-DA-01', 4),
        (N'AGT-001', N'RES-DA-05', 5),
        (N'AGT-001', N'RES-DA-02', 6),
        (N'AGT-001', N'RES-DA-06', 7),
        (N'SYS-001', N'RES-ECIF-01', 1),
        (N'SYS-002', N'RES-ECIF-01', 1),
        (N'AGT-002', N'RES-ECIF-01', 3),
        (N'AGT-005', N'RES-SCOUT-01', 1),
        (N'AGT-005', N'RES-SCOUT-02', 2)
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
        (N'AGT-001', N'RES-001', 1),
        (N'AGT-001', N'RES-002', 2),
        (N'AGT-004', N'RES-003', 1),
        (N'AGT-006', N'RES-004', 1),
        (N'AGT-009', N'RES-006', 1),
        (N'AGT-011', N'RES-007', 1),
        (N'AGT-002', N'RES-008', 1),
        (N'AGT-001', N'RES-GLOBAL-01', 3),
        (N'AGT-002', N'RES-GLOBAL-01', 2),
        (N'AGT-003', N'RES-GLOBAL-01', 1),
        (N'AGT-004', N'RES-GLOBAL-01', 2),
        (N'AGT-011', N'RES-CSAM-PERSONA', 2),
        (N'AGT-012', N'RES-CSAM-HEALTH', 1),
        (N'AGT-001', N'RES-DA-01', 4),
        (N'AGT-001', N'RES-DA-05', 5),
        (N'AGT-001', N'RES-DA-02', 6),
        (N'AGT-001', N'RES-DA-06', 7),
        (N'SYS-001', N'RES-ECIF-01', 1),
        (N'SYS-002', N'RES-ECIF-01', 1),
        (N'AGT-002', N'RES-ECIF-01', 3),
        (N'AGT-005', N'RES-SCOUT-01', 1),
        (N'AGT-005', N'RES-SCOUT-02', 2)
    ) v([AgentExternalId], [ResourceExternalId], [DisplayOrder])
)
SELECT @unresolved = 22 - COUNT(*) FROM raw
    INNER JOIN dbo.HuddleAgents AS ag ON ag.[ExternalId] = raw.[AgentExternalId]
    INNER JOIN dbo.HuddleResources AS rs ON rs.[ExternalId] = raw.[ResourceExternalId];
IF @unresolved <> 0
    THROW 51000, 'HuddleAgentResources: 22 source rows were expected to resolve their foreign keys but some did not. Run the earlier scripts in order and re-check the workbook.', 1;

COMMIT TRANSACTION;
GO
