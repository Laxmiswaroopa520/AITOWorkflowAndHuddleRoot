
USE [AitoWorkflowAndHuddleGeneratorDb];
GO
SET NOCOUNT ON;
SET XACT_ABORT ON;
GO
BEGIN TRY
    BEGIN TRANSACTION;
    DECLARE @SourceCount int = 0, @InsertedCount int = 0, @UpdatedCount int = 0, @SkippedCount int = 0, @DuplicateCount int = 0, @MissingRelationshipCount int = 0;
    DECLARE @Source TABLE(ExternalId nvarchar(100),Name nvarchar(300),Description nvarchar(max),Type nvarchar(50),PublicationStatus nvarchar(50),FocusExternalId nvarchar(100),DurationMinutes int,RecommendationPriority int,AudienceDescription nvarchar(max),TodayObjective nvarchar(max),UseCase nvarchar(max),WhyItMatters nvarchar(max),DesiredOutcome nvarchar(max),StepsToGetStarted nvarchar(max),ReflectionPrompt nvarchar(max),CommitmentPrompt nvarchar(max),KeyTakeaway nvarchar(max));
    INSERT @Source VALUES
(N'WF-ADOPT-01',N'Accelerate Adoption and Prove Value Realization',NULL,N'Prescriptive',N'WorkingDraft',N'focus-customer-success-and-value-realization',30,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(N'WF-ARCH-01',N'Design a Production-Ready Customer Architecture',NULL,N'Prescriptive',N'WorkingDraft',N'focus-technical-customer-success',30,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(N'WF-CE-APPROVAL-01',N'Orchestrate Approvals and Commercial Execution',NULL,N'Prescriptive',N'WorkingDraft',N'focus-commercial-strategy-and-execution',30,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(N'WF-CE-NEG-01',N'Prepare and Lead the Commercial Negotiation',NULL,N'Prescriptive',N'WorkingDraft',N'focus-commercial-strategy-and-execution',30,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(N'WF-CE-POLICY-01',N'Validate Licensing, Policy and Compliance',NULL,N'Prescriptive',N'WorkingDraft',N'focus-commercial-strategy-and-execution',30,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(N'WF-CE-RENEW-01',N'Build and Execute the Renewal Strategy',NULL,N'Prescriptive',N'WorkingDraft',N'focus-commercial-strategy-and-execution',30,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(N'WF-CE-RISK-01',N'Prioritize Commercial Risk and Intervention',NULL,N'Prescriptive',N'WorkingDraft',N'focus-commercial-strategy-and-execution',30,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(N'WF-CE-STRUCT-01',N'Develop Commercial Options and Deal Structure',NULL,N'Prescriptive',N'WorkingDraft',N'focus-commercial-strategy-and-execution',30,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(N'WF-CE-TRANS-01',N'Navigate Agreement and Commerce Transitions',NULL,N'Prescriptive',N'WorkingDraft',N'focus-commercial-strategy-and-execution',30,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(N'WF-COMP-01',N'Develop a Competitive Position and Response Plan',NULL,N'Prescriptive',N'WorkingDraft',N'focus-solution-strategy',30,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(N'WF-CONSUME-01',N'Forecast Consumption and Intervene on Risk',NULL,N'Prescriptive',N'WorkingDraft',N'focus-technical-customer-success',30,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(N'WF-CONV-01',N'Prepare for a Customer Conversation',NULL,N'Prescriptive',N'WorkingDraft',N'focus-customer-engagement',30,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(N'WF-CS-HEALTH-01',N'Assess Customer Health and Prioritize Risk Response',NULL,N'Prescriptive',N'WorkingDraft',N'focus-customer-success-and-value-realization',30,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(N'WF-CS-ORCH-01',N'Orchestrate Customer, Internal Team, Partners, and Delivery',NULL,N'Prescriptive',N'WorkingDraft',N'focus-customer-success-and-value-realization',30,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(N'WF-DEAL-01',N'Accelerate a Strategic Deal',NULL,N'Prescriptive',N'WorkingDraft',N'focus-deal-execution',30,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(N'WF-EBC-01',N'Design an Executive Briefing Experience',NULL,N'Prescriptive',N'WorkingDraft',N'focus-customer-engagement',30,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(N'WF-ESC-01',N'Quarterback Delivery Risk, Incidents, and Escalations',NULL,N'Prescriptive',N'WorkingDraft',N'focus-customer-success-and-value-realization',30,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(N'WF-FCST-01',N'Build a Decision-Ready Forecast Narrative',NULL,N'Prescriptive',N'WorkingDraft',N'focus-pipeline-and-forecasting',30,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(N'WF-HEALTH-01',N'Assess Customer Technical Health and Prioritize Risk',NULL,N'Prescriptive',N'WorkingDraft',N'focus-technical-customer-success',30,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(N'WF-INTEL-01',N'Build an Account Intelligence and Meeting Prep Brief',NULL,N'Prescriptive',N'WorkingDraft',N'focus-planning-and-prioritization',30,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(N'WF-LEAD-01',N'Prioritize Prospects and Follow Up on Leads',NULL,N'Prescriptive',N'WorkingDraft',N'focus-pipeline-development',30,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(N'WF-NARR-01',N'Assemble an Executive Technical Customer Narrative',NULL,N'Prescriptive',N'WorkingDraft',N'focus-customer-engagement',30,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(N'WF-OPP-01',N'Create and Qualify New Opportunities',NULL,N'Prescriptive',N'WorkingDraft',N'focus-opportunity-development',30,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(N'WF-OPT-01',N'Build a FinOps and Optimization Recommendation',NULL,N'Prescriptive',N'WorkingDraft',N'focus-technical-customer-success',30,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(N'WF-PIPE-01',N'Inspect Pipeline Health and Restore Signal Quality',NULL,N'Prescriptive',N'WorkingDraft',N'focus-pipeline-and-forecasting',30,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(N'WF-PLAN-01',N'Prioritize Accounts and Build an Actionable Account Plan',NULL,N'Prescriptive',N'WorkingDraft',N'focus-planning-and-prioritization',30,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(N'WF-RENEW-01',N'Manage Renewal Risk and Expansion Readiness',NULL,N'Prescriptive',N'WorkingDraft',N'focus-renewal-and-expansion',30,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(N'WF-SE-ARCH-01',N'Design and Validate the Customer Architecture',NULL,N'Prescriptive',N'WorkingDraft',N'focus-technical-solution-design-and-execution',30,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(N'WF-SE-ASSET-01',N'Capture and Reuse Technical Assets and Learning',NULL,N'Prescriptive',N'WorkingDraft',N'focus-technical-solution-design-and-execution',30,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(N'WF-SE-DEAL-01',N'Manage Technical Risk and Advance the Deal',NULL,N'Prescriptive',N'WorkingDraft',N'focus-technical-solution-design-and-execution',30,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(N'WF-SE-DEMO-01',N'Design a Demo or Workshop That Advances the Decision',NULL,N'Prescriptive',N'WorkingDraft',N'focus-technical-solution-design-and-execution',30,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(N'WF-SE-DISC-01',N'Lead Technical Discovery and Define Decision Criteria',NULL,N'Prescriptive',N'WorkingDraft',N'focus-technical-solution-design-and-execution',30,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(N'WF-SE-POC-01',N'Scope a PoC with Success and Exit Criteria',NULL,N'Prescriptive',N'WorkingDraft',N'focus-technical-solution-design-and-execution',30,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(N'WF-SE-QA-01',N'Respond to Technical Questions with Evidence and Confidence',NULL,N'Prescriptive',N'WorkingDraft',N'focus-technical-solution-design-and-execution',30,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(N'WF-SOLUTION-01',N'Build a Solution-Selling Plan',NULL,N'Prescriptive',N'WorkingDraft',N'focus-solution-strategy',30,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(N'WF-SUCCESS-01',N'Build and Govern an Outcome-Anchored Success Plan',NULL,N'Prescriptive',N'WorkingDraft',N'focus-customer-success-and-value-realization',30,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(N'WF-TALK-01',N'Adjust the Technical Talk Track from Customer Signals',NULL,N'Prescriptive',N'WorkingDraft',N'focus-customer-engagement',30,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(N'WF-TEAM-01',N'Mobilize the Account Team and Partners',NULL,N'Prescriptive',N'WorkingDraft',N'focus-cross-team-orchestration',30,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(N'WF-TECH-01',N'Build the Technical Decision and Validation Path',NULL,N'Prescriptive',N'WorkingDraft',N'focus-technical-customer-success',30,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(N'WF-TECH-CONV-01',N'Prepare a Technical Advisory Customer Conversation',NULL,N'Prescriptive',N'WorkingDraft',N'focus-technical-customer-success',30,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(N'WF-VALUE-01',N'Develop a Customer-Specific Value Narrative',NULL,N'Prescriptive',N'WorkingDraft',N'focus-customer-value',30,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(N'WF-VALUE-TECH-01',N'Translate Technical Progress into Customer Value',NULL,N'Prescriptive',N'WorkingDraft',N'focus-customer-value',30,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(N'WF-VTEAM-01',N'Orchestrate the Specialist, Technical Team, Partners, and Funding',NULL,N'Prescriptive',N'WorkingDraft',N'focus-work-orchestration',30,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(N'WF-WORKLOAD-01',N'Prioritize AI and Azure Workloads by Readiness and Impact',NULL,N'Prescriptive',N'WorkingDraft',N'focus-solution-strategy',30,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(N'required-researcher',N'Researcher',N'Investigate complex topics and prepare credible, decision-ready briefs.',N'Foundation',N'WorkingDraft',NULL,30,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(N'required-sales-agent',N'Sales Agent',N'Execute seller workflows using grounded sales and customer data.',N'Foundation',N'WorkingDraft',NULL,30,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(N'required-cowork',N'Cowork',N'Delegate a multi-step Microsoft 365 outcome rather than completing each step manually.',N'Foundation',N'WorkingDraft',NULL,30,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(N'required-scout',N'Scout',N'Coordinate work that spans local files, browsers, systems, and Microsoft 365.',N'Foundation',N'WorkingDraft',NULL,30,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),
(N'required-agent-j',N'Agent J.ai',N'Prepare for, practise, and improve important customer and stakeholder conversations.',N'Foundation',N'WorkingDraft',NULL,30,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL); SELECT @SourceCount=COUNT(*) FROM @Source; SELECT @DuplicateCount=COUNT(*) FROM(SELECT ExternalId FROM @Source GROUP BY ExternalId HAVING COUNT(*)>1)d; IF @DuplicateCount>0 THROW 51001,'Duplicate topic external IDs.',1;
    SELECT @MissingRelationshipCount=COUNT(*) FROM @Source s WHERE s.FocusExternalId IS NOT NULL AND NOT EXISTS(SELECT 1 FROM dbo.HuddleFocusAreas f WHERE f.ExternalId=s.FocusExternalId);
    SELECT @UpdatedCount=COUNT(*) FROM @Source s JOIN dbo.HuddleTopics t ON t.ExternalId=s.ExternalId;
    UPDATE t SET t.Name=s.Name,t.Description=s.Description,t.Type=s.Type,t.PublicationStatus=s.PublicationStatus,t.HuddleFocusAreaId=f.Id,t.DurationMinutes=s.DurationMinutes,t.RecommendationPriority=NULL,t.AudienceDescription=NULL,t.TodayObjective=NULL,t.UseCase=NULL,t.WhyItMatters=NULL,t.DesiredOutcome=NULL,t.StepsToGetStarted=NULL,t.ReflectionPrompt=NULL,t.CommitmentPrompt=NULL,t.KeyTakeaway=NULL,t.UpdatedAtUtc=SYSUTCDATETIME() FROM dbo.HuddleTopics t JOIN @Source s ON s.ExternalId=t.ExternalId LEFT JOIN dbo.HuddleFocusAreas f ON f.ExternalId=s.FocusExternalId;
    INSERT dbo.HuddleTopics(ExternalId,Name,Description,Type,PublicationStatus,HuddleFocusAreaId,DurationMinutes,RecommendationPriority,AudienceDescription,TodayObjective,UseCase,WhyItMatters,DesiredOutcome,StepsToGetStarted,ReflectionPrompt,CommitmentPrompt,KeyTakeaway,CreatedAtUtc) SELECT s.ExternalId,s.Name,s.Description,s.Type,s.PublicationStatus,f.Id,s.DurationMinutes,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,SYSUTCDATETIME() FROM @Source s LEFT JOIN dbo.HuddleFocusAreas f ON f.ExternalId=s.FocusExternalId WHERE (s.FocusExternalId IS NULL OR f.Id IS NOT NULL) AND NOT EXISTS(SELECT 1 FROM dbo.HuddleTopics t WHERE t.ExternalId=s.ExternalId); SET @InsertedCount=@@ROWCOUNT; SET @SkippedCount=@SourceCount-@InsertedCount-@UpdatedCount;
    SELECT @SourceCount AS SourceCount, @InsertedCount AS InsertedCount, @UpdatedCount AS UpdatedCount, @SkippedCount AS SkippedCount, @DuplicateCount AS DuplicateExternalIds, @MissingRelationshipCount AS MissingRelationships;
    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
    THROW;
END CATCH;
GO
