/*
    IMPORTANT:
    Review the selected database before executing this script.
    This script was generated for manual execution in SSMS.
    It has not been executed by Codex.
*/
USE [AitoWorkflowAndHuddleGeneratorDb];
GO
SET NOCOUNT ON;
SET XACT_ABORT ON;
GO
BEGIN TRY
    BEGIN TRANSACTION;
    DECLARE @SourceCount int = 0, @InsertedCount int = 0, @UpdatedCount int = 0, @SkippedCount int = 0, @DuplicateCount int = 0, @MissingRelationshipCount int = 0;
    DECLARE @Source TABLE(ActivityExternalId nvarchar(100),AgentExternalId nvarchar(100),UsageType nvarchar(20),DisplayOrder int); INSERT @Source VALUES
(N'WF-SE-DISC-01-P-SE-01',N'TOOL-001',N'Primary',1),
(N'WF-SE-DISC-01-P-SE-02',N'TOOL-010',N'Primary',1),
(N'WF-SE-ARCH-01-P-SE-01',N'TOOL-005',N'Primary',1),
(N'WF-SE-ARCH-01-P-SE-02',N'TOOL-001',N'Primary',1),
(N'WF-SE-DEMO-01-P-SE-01',N'TOOL-003',N'Primary',1),
(N'WF-SE-DEMO-01-P-SE-02',N'TOOL-005',N'Primary',1),
(N'WF-SE-POC-01-P-SE-01',N'TOOL-003',N'Primary',1),
(N'WF-SE-POC-01-P-SE-02',N'TOOL-001',N'Primary',1),
(N'WF-SE-DEAL-01-P-SE-01',N'TOOL-002',N'Primary',1),
(N'WF-SE-DEAL-01-P-SE-02',N'TOOL-001',N'Primary',1),
(N'WF-SE-ASSET-01-P-SE-01',N'TOOL-003',N'Primary',1),
(N'WF-SE-QA-01-P-SE-01',N'TOOL-005',N'Primary',1),
(N'WF-SE-QA-01-P-SE-02',N'TOOL-003',N'Primary',1),
(N'WF-CE-RISK-01-P-CE-01',N'TOOL-008',N'Primary',1),
(N'WF-CE-RISK-01-P-CE-02',N'TOOL-002',N'Primary',1),
(N'WF-CE-STRUCT-01-P-CE-01',N'TOOL-002',N'Primary',1),
(N'WF-CE-STRUCT-01-P-CE-02',N'TOOL-001',N'Primary',1),
(N'WF-CE-POLICY-01-P-CE-01',N'TOOL-003',N'Primary',1),
(N'WF-CE-POLICY-01-P-CE-02',N'TOOL-002',N'Primary',1),
(N'WF-CE-NEG-01-P-CE-01',N'TOOL-002',N'Primary',1),
(N'WF-CE-NEG-01-P-CE-02',N'TOOL-010',N'Primary',1),
(N'WF-CE-APPROVAL-01-P-CE-01',N'TOOL-002',N'Primary',1),
(N'WF-CE-APPROVAL-01-P-CE-02',N'TOOL-001',N'Primary',1),
(N'WF-CE-RENEW-01-P-CE-01',N'TOOL-002',N'Primary',1),
(N'WF-CE-RENEW-01-P-CE-02',N'TOOL-008',N'Primary',1),
(N'WF-CE-TRANS-01-P-CE-01',N'TOOL-005',N'Primary',1),
(N'WF-CE-TRANS-01-P-CE-02',N'TOOL-001',N'Primary',1),
(N'WF-HEALTH-01-P-CSA-01',N'TOOL-001',N'Primary',1),
(N'WF-HEALTH-01-P-CSA-02',N'TOOL-008',N'Primary',1),
(N'WF-ARCH-01-P-CSA-01',N'TOOL-005',N'Primary',1),
(N'WF-ARCH-01-P-CSA-02',N'TOOL-003',N'Primary',1),
(N'WF-TECH-01-P-CSA-01',N'TOOL-002',N'Primary',1),
(N'WF-TECH-01-P-CSA-02',N'TOOL-003',N'Primary',1),
(N'WF-TECH-CONV-01-P-CSA-01',N'TOOL-001',N'Primary',1),
(N'WF-TECH-CONV-01-P-CSA-02',N'TOOL-010',N'Primary',1),
(N'WF-CONSUME-01-P-CSA-01',N'TOOL-008',N'Primary',1),
(N'WF-CONSUME-01-P-CSA-02',N'TOOL-002',N'Primary',1),
(N'WF-OPT-01-P-CSA-01',N'TOOL-008',N'Primary',1),
(N'WF-OPT-01-P-CSA-02',N'TOOL-003',N'Primary',1),
(N'WF-VALUE-TECH-01-P-CSA-01',N'TOOL-001',N'Primary',1),
(N'WF-VALUE-TECH-01-P-CSA-02',N'TOOL-003',N'Primary',1),
(N'AE-01-P01',N'TOOL-008',N'Primary',1),
(N'AE-01-P04',N'TOOL-011',N'Primary',1),
(N'AE-02-P01',N'TOOL-008',N'Primary',1),
(N'AE-02-P02',N'TOOL-001',N'Primary',1),
(N'AE-03-P01',N'TOOL-002',N'Primary',1),
(N'AE-03-P02',N'TOOL-004',N'Primary',1),
(N'AE-04-P01',N'TOOL-002',N'Primary',1),
(N'AE-04-P02',N'TOOL-002',N'Primary',1),
(N'AE-05-P01',N'TOOL-002',N'Primary',1),
(N'AE-05-P02',N'TOOL-002',N'Primary',1),
(N'AE-07-P01',N'TOOL-002',N'Primary',1),
(N'AE-07-P02',N'TOOL-001',N'Primary',1),
(N'AE-06-P-AE01',N'TOOL-002',N'Primary',1),
(N'WF-CONV-01-P-AE-JAI',N'TOOL-010',N'Primary',1),
(N'WF-INTEL-01-P-ATS-01',N'TOOL-003',N'Primary',1),
(N'WF-INTEL-01-P-ATS-02',N'TOOL-008',N'Primary',1),
(N'WF-NARR-01-P-ATS-01',N'TOOL-002',N'Primary',1),
(N'WF-NARR-01-P-ATS-02',N'TOOL-003',N'Primary',1),
(N'WF-WORKLOAD-01-P-ATS-01',N'TOOL-008',N'Primary',1),
(N'WF-WORKLOAD-01-P-ATS-02',N'TOOL-005',N'Primary',1),
(N'WF-TECH-01-P-ATS-STRAT01',N'TOOL-002',N'Primary',1),
(N'WF-TECH-01-P-ATS-STRAT02',N'TOOL-005',N'Primary',1),
(N'WF-EBC-01-P-ATS-01',N'TOOL-003',N'Primary',1),
(N'WF-TALK-01-P-ATS-JAI',N'TOOL-010',N'Primary',1),
(N'WF-TALK-01-P-ATS-02',N'TOOL-001',N'Primary',1),
(N'WF-TEAM-01-P-ATS-01',N'TOOL-001',N'Primary',1),
(N'WF-TEAM-01-P-ATS-ECIF02',N'TOOL-002',N'Primary',1),
(N'WF-LEAD-01-P-SSP-01',N'TOOL-003',N'Primary',1),
(N'WF-LEAD-01-P-SSP-02',N'TOOL-002',N'Primary',1),
(N'WF-SOLUTION-01-P-SSP-01',N'TOOL-002',N'Primary',1),
(N'WF-SOLUTION-01-P-SSP-02',N'TOOL-003',N'Primary',1),
(N'WF-VALUE-01-P-SSP-01',N'TOOL-001',N'Primary',1),
(N'WF-VALUE-01-P-SSP-02',N'TOOL-005',N'Primary',1),
(N'WF-CONV-01-P-SSP-01',N'TOOL-002',N'Primary',1),
(N'WF-VTEAM-01-P-SSP-01',N'TOOL-001',N'Primary',1),
(N'WF-VTEAM-01-P-SSP-02',N'TOOL-002',N'Primary',1),
(N'WF-COMP-01-P-SSP-01',N'TOOL-008',N'Primary',1),
(N'WF-COMP-01-P-SSP-02',N'TOOL-005',N'Primary',1),
(N'WF-DEAL-01-P-SSP-01',N'TOOL-002',N'Primary',1),
(N'WF-DEAL-01-P-SSP-02',N'TOOL-008',N'Primary',1),
(N'WF-CONV-01-P-SSP-JAI',N'TOOL-010',N'Primary',1),
(N'WF-CS-HEALTH-01-P-CSAM-01',N'TOOL-008',N'Primary',1),
(N'WF-CS-HEALTH-01-P-CSAM-02',N'TOOL-008',N'Primary',1),
(N'WF-SUCCESS-01-P-CSAM-01',N'TOOL-001',N'Primary',1),
(N'WF-SUCCESS-01-P-CSAM-02',N'TOOL-003',N'Primary',1),
(N'WF-CS-ORCH-01-P-CSAM-01',N'TOOL-003',N'Primary',1),
(N'WF-CS-ORCH-01-P-CSAM-02',N'TOOL-002',N'Primary',1),
(N'WF-ESC-01-P-CSAM-01',N'TOOL-002',N'Primary',1),
(N'WF-ESC-01-P-CSAM-02',N'TOOL-001',N'Primary',1),
(N'WF-CONSUME-01-P-CSAM-01',N'TOOL-008',N'Primary',1),
(N'WF-CONSUME-01-P-CSAM-02',N'TOOL-002',N'Primary',1),
(N'WF-ADOPT-01-P-CSAM-01',N'TOOL-005',N'Primary',1),
(N'WF-ADOPT-01-P-CSAM-02',N'TOOL-008',N'Primary',1),
(N'WF-RENEW-01-P-CSAM-01',N'TOOL-002',N'Primary',1),
(N'WF-RENEW-01-P-CSAM-02',N'TOOL-010',N'Primary',1); SELECT @SourceCount=COUNT(*) FROM @Source;
    SELECT @MissingRelationshipCount=COUNT(*) FROM @Source s LEFT JOIN dbo.HuddleActivities h ON h.ExternalId=s.ActivityExternalId LEFT JOIN dbo.HuddleAgents a ON a.ExternalId=s.AgentExternalId WHERE h.Id IS NULL OR a.Id IS NULL;
    
    INSERT dbo.HuddleActivityAgents(HuddleActivityId,HuddleAgentId,UsageType,DisplayLabel,ShowAgentAccessLink,DisplayOrder) SELECT h.Id,a.Id,s.UsageType,NULL,CAST(1 AS bit),s.DisplayOrder FROM @Source s JOIN dbo.HuddleActivities h ON h.ExternalId=s.ActivityExternalId JOIN dbo.HuddleAgents a ON a.ExternalId=s.AgentExternalId WHERE NOT EXISTS(SELECT 1 FROM dbo.HuddleActivityAgents x WHERE x.HuddleActivityId=h.Id AND x.HuddleAgentId=a.Id AND x.UsageType=s.UsageType);
    SET @InsertedCount=@@ROWCOUNT; SET @SkippedCount=@SourceCount-@InsertedCount-@UpdatedCount;
    SELECT @SourceCount AS SourceCount, @InsertedCount AS InsertedCount, @UpdatedCount AS UpdatedCount, @SkippedCount AS SkippedCount, @DuplicateCount AS DuplicateExternalIds, @MissingRelationshipCount AS MissingRelationships;
    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
    THROW;
END CATCH;
GO
