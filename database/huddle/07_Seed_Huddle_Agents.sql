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
    DECLARE @Source TABLE (ExternalId nvarchar(100),Name nvarchar(200),ShortDescription nvarchar(1000),WhatItIs nvarchar(max),WhatItHelpsYouDo nvarchar(max),WhenToUseIt nvarchar(max),KeyBenefits nvarchar(max),AccessUrl nvarchar(2000),AccessLinkLabel nvarchar(200));
    INSERT @Source VALUES
(N'TOOL-001',N'Microsoft 365 Copilot',N'AI assistant across Microsoft 365 apps and work data.',NULL,N'Draft, summarize, analyze, prepare, and create within familiar Microsoft 365 experiences.',N'Everyday work grounded in emails, meetings, chats, files, and app content.',N'["Reduces time spent drafting, summarizing, and preparing work.","Uses permitted Microsoft 365 context to keep work grounded."]',NULL,NULL),
(N'TOOL-002',N'Sales Agent',N'Conversational sales agent available across Microsoft 365 and supported Dynamics 365 Sales experiences.',NULL,N'Search, synthesize, and act on sales data; support repeatable execution-focused sales workflows.',N'Account, opportunity, pipeline, meeting preparation, CRM updates, and configured sales actions.',N'["Brings sales data and actions into the flow of work.","Reduces navigation across CRM pages and disconnected sales tools."]',NULL,NULL),
(N'TOOL-003',N'Cowork',N'Agentic Microsoft 365 experience for longer-running, outcome-focused, multi-source work.',NULL,N'Plans and executes multistep work, invokes skills, and creates deliverables with checkpoints.',N'Complex tasks spanning Microsoft 365, Dynamics 365 data, documents, presentations, and recommendations.',N'["Delegates multi-step outcomes instead of manually stitching tasks together.","Creates deliverables while keeping the user in control through checkpoints."]',NULL,NULL),
(N'TOOL-004',N'Scout',N'Always-on agent designed to keep work moving across Microsoft 365 and the desktop.',NULL,N'Monitors signals, coordinates follow-through, prepares materials, and acts within organizational controls.',N'Continuous or proactive work that should persist beyond one chat.',N'["Keeps follow-through moving across ongoing priorities.","Surfaces risks and preparation needs proactively."]',NULL,NULL),
(N'TOOL-005',N'Researcher',N'Deep research agent in Microsoft 365 Copilot that produces structured, source-cited reports.',NULL,N'Combines work content and web research across multiple steps.',N'Customer, market, competitor, industry, and strategic research requiring citations.',N'["Produces structured research with citations.","Combines internal work context with external sources for deeper analysis."]',NULL,NULL),
(N'TOOL-006',N'Analyst',N'Data-analysis agent in Microsoft 365 Copilot for statistics, trends, outliers, charts, and reports.',NULL,N'Analyzes supplied data and produces understandable findings and visuals.',N'Multi-file quantitative analysis, trend analysis, and executive-ready data insights.',N'["Turns raw data into trends, outliers, charts, and clear findings.","Reduces the need for advanced analysis expertise."]',NULL,NULL),
(N'TOOL-007',N'MSXI Copilot',N'Conversational Copilot panel embedded in AI-certified MSXI reports.',NULL,N'Answers business questions against certified report data and helps users navigate metrics and insights.',N'Questions tied to an available AI-certified MSXI report.',N'["Lets users ask business questions directly against certified MSXI report data.","Reduces manual dashboard navigation for supported questions."]',NULL,NULL),
(N'TOOL-008',N'MSXI Assist V2',N'Assistance within MSXI for report discovery, KPI definitions, and report actions.',NULL,N'Helps users find reports, understand KPI definitions, and take supported report actions.',N'When the job is navigating MSXI content or understanding a metric.',N'["Helps users find the right MSXI report and understand KPI definitions.","Reduces dependence on expert help for basic report navigation."]',NULL,NULL),
(N'TOOL-009',N'Proactive Insights in MSXI',N'AI-driven MSXI capability that delivers prioritized metric changes, trends, and recommended actions.',NULL,N'Moves users from manually checking reports to receiving relevant insight summaries.',N'Recurring monitoring of supported MSXI business metrics.',N'["Surfaces significant metric changes without requiring manual report checks.","Supports earlier awareness of trends and recommended actions."]',NULL,NULL),
(N'TOOL-010',N'Agent J.ai',N'Text-based coaching experience grounded in Microsoft 365 context and curated content.',NULL,N'Helps users sharpen messages, rehearse conversations, anticipate objections, and plan next steps.',N'Customer conversation preparation and role-play.',N'["Improves preparation for customer conversations through coaching and role-play.","Helps users test messages and objections before the live conversation."]',NULL,NULL),
(N'TOOL-011',N'Auto-Fix Pipeline Agent in MSX',N'Agent in MSX intended to resolve supported pipeline hygiene issues.',NULL,N'Supports targeted pipeline cleanup inside MSX.',N'When a Practice explicitly addresses supported pipeline hygiene correction.',N'["Reduces manual effort for supported pipeline-hygiene corrections.","Helps keep pipeline records more current within the supported scope."]',NULL,NULL);
    SELECT @SourceCount=COUNT(*) FROM @Source;
    SELECT @DuplicateCount=COUNT(*) FROM (SELECT ExternalId FROM @Source GROUP BY ExternalId HAVING COUNT(*)>1) d;
    IF @DuplicateCount>0 THROW 51001, 'Duplicate source external IDs.', 1;
    SELECT @UpdatedCount=COUNT(*) FROM dbo.HuddleAgents t JOIN @Source s ON s.ExternalId=t.ExternalId;
    UPDATE t SET t.Name=s.Name,t.ShortDescription=s.ShortDescription,t.WhatItIs=s.WhatItIs,t.WhatItHelpsYouDo=s.WhatItHelpsYouDo,t.WhenToUseIt=s.WhenToUseIt,t.KeyBenefits=s.KeyBenefits,t.AccessUrl=s.AccessUrl,t.AccessLinkLabel=s.AccessLinkLabel, t.UpdatedAtUtc=SYSUTCDATETIME() FROM dbo.HuddleAgents t JOIN @Source s ON s.ExternalId=t.ExternalId;
    INSERT dbo.HuddleAgents (ExternalId,Name,ShortDescription,WhatItIs,WhatItHelpsYouDo,WhenToUseIt,KeyBenefits,AccessUrl,AccessLinkLabel,CreatedAtUtc,UpdatedAtUtc)
    SELECT s.ExternalId,s.Name,s.ShortDescription,s.WhatItIs,s.WhatItHelpsYouDo,s.WhenToUseIt,s.KeyBenefits,s.AccessUrl,s.AccessLinkLabel,SYSUTCDATETIME(),NULL FROM @Source s WHERE NOT EXISTS (SELECT 1 FROM dbo.HuddleAgents t WHERE t.ExternalId=s.ExternalId);
    SET @InsertedCount=@@ROWCOUNT; SET @SkippedCount=@SourceCount-@InsertedCount-@UpdatedCount;
    SELECT @SourceCount AS SourceCount, @InsertedCount AS InsertedCount, @UpdatedCount AS UpdatedCount, @SkippedCount AS SkippedCount, @DuplicateCount AS DuplicateExternalIds, @MissingRelationshipCount AS MissingRelationships;
    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
    THROW;
END CATCH;
GO
