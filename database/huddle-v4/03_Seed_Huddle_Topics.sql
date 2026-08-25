/*
    Huddle topics and their aligned roles
    Generated from the Frontier Accelerator content workbook by generate.py.
    Do not hand-edit. Re-runnable: every statement is an ExternalId-keyed MERGE, nothing is deleted.
*/
SET NOCOUNT ON;
SET XACT_ABORT ON;
DECLARE @unresolved INT;
BEGIN TRANSACTION;

;WITH raw AS (
    SELECT * FROM (VALUES
        (N'WF-X-PLAN-01', N'Prioritize and Plan the Account', N'Decide where attention goes across accounts, workloads or solutions, and turn that decision into a plan someone can act on.', N'Prescriptive', N'Published', N'FA-01', 30, N'Time is the scarcest resource in the week. Deciding where it goes on evidence, rather than by habit or by whoever asked last, is the difference between a quarter you shaped and one that happened to you.', N'A short, prioritized set of accounts, workloads or solution plays with a named next action and owner for each.', N'Prioritization is a decision about what you will not do. AI can assemble the evidence; the choice stays yours.'),
        (N'WF-X-PIPE-01', N'Inspect the Pipeline and Build the Forecast', N'Inspect what the data says, correct what misrepresents reality, and build a forecast you can defend.', N'Prescriptive', N'Published', N'FA-01', 30, N'Every forecast conversation, coverage review and consumption call rests on data somebody has to trust. When the underlying signal is wrong, everything built on it is guesswork wearing a number.', N'Corrected records and a defensible narrative that explains the position, the risk and what would close the gap.', N'A forecast is an argument, not a number. AI improves the evidence; it does not make the call.'),
        (N'WF-X-OPP-01', N'Create and Qualify Demand', N'Find the next real opportunity from signals already available, and qualify it on evidence rather than optimism.', N'Prescriptive', N'Published', N'FA-01', 30, N'Pipeline gaps are usually discovery gaps. The signals for the next opportunity are already sitting in accounts we own; the work is finding them on purpose rather than by luck.', N'At least one new qualified opportunity with a documented trigger and a tested reason it is real.', N'A pipeline gap is usually a discovery gap. Qualification is a test, not a stage.'),
        (N'WF-X-CONV-01', N'Prepare and Lead a Customer Conversation', N'Prepare for the conversation that moves the decision, anticipate what will be asked, and lead it with evidence.', N'Prescriptive', N'Published', N'FA-02', 30, N'Customer conversations are where decisions actually move. They are won or lost in preparation, and preparation is the first thing dropped when the calendar fills.', N'A prepared conversation with a stated intended outcome, the likely objections anticipated and the evidence ready.', N'Preparation is where the meeting is decided. AI makes good preparation fast enough to actually happen.'),
        (N'WF-X-ARCH-01', N'Design and Validate the Technical Solution', N'Design the solution, then prove it works well enough for the customer to decide.', N'Prescriptive', N'Published', N'FA-05', 30, N'A design the customer cannot see or test is a document. Proof is what converts technical work into a customer decision, and criteria set afterwards get argued about forever.', N'A validated design with explicit success and exit criteria the customer has agreed to.', N'A design nobody has argued against has not been validated. Proof is what converts a design into a decision.'),
        (N'WF-X-DISC-01', N'Lead Discovery and Define Decision Criteria', N'Understand the real problem and agree what would make the customer decide.', N'Prescriptive', N'Published', N'FA-05', 30, N'Discovery that ends without agreed decision criteria produces a second discovery meeting. The stated problem is rarely the real one.', N'A bounded problem statement, named evidence gaps and written decision criteria.', N'Discovery that does not end in decision criteria is a conversation, not discovery.'),
        (N'WF-X-HEALTH-01', N'Assess Health and Prioritize Risk', N'Find the risk that matters most right now, and decide what to do about it while it is still cheap.', N'Prescriptive', N'Published', N'FA-06', 30, N'Risk found early is a conversation. The same risk found late is an escalation with an audience. Scores tell us something is wrong; they rarely tell us what to do.', N'A ranked risk view with an owner, a date and one intervention already started.', N'Risk found early is a conversation. The same risk found late is an escalation.'),
        (N'WF-X-DEAL-01', N'Advance and Structure the Deal', N'Move the deal to its next decision, and structure it so it can actually be approved.', N'Prescriptive', N'Published', N'FA-03', 30, N'Deals stall on structure more often than on merit. The cost of discovering an approval requirement late is measured in weeks.', N'The next decision named, the blockers owned and a structure that can actually be approved.', N'Deals stall on structure more often than on merit. Getting the shape right early is the cheapest work available.'),
        (N'WF-X-VALUE-01', N'Prove and Communicate Value', N'Turn what has actually happened into a value story the customer recognizes and will act on.', N'Prescriptive', N'Published', N'FA-02', 30, N'Value that is not evidenced reads as opinion, and value never communicated is invisible at renewal. Customers judge us on outcomes they can see.', N'An evidence-based value story in the customer''s own terms, with gaps named honestly.', N'Value that is not evidenced is an opinion. Value that is not communicated is invisible.'),
        (N'WF-X-RENEW-01', N'Manage Renewal and Expansion', N'Protect the renewal and find the expansion that is already inside it.', N'Prescriptive', N'Published', N'FA-03', 30, N'A renewal is decided months before the date, usually by whether value was evidenced along the way. Expansion is easier to find inside a healthy renewal than outside one.', N'A renewal position with the largest risk named and one evidenced expansion hypothesis.', N'A renewal is decided months before the date. The work is in seeing the risk early enough to act.'),
        (N'WF-X-ORCH-01', N'Orchestrate the Team, Partners and Delivery', N'Get the right people moving on the right thing, and keep the handoffs clean enough to survive contact.', N'Prescriptive', N'Published', N'FA-07', 30, N'Most work stalls in the handoff, not the task. Account teams carry responsibility without authority, and explicit handoffs are the only reliable substitute.', N'A mobilized team with a named owner, input and date for every handoff, and stalled items escalated.', N'Most work stalls in the handoff, not in the task. Orchestration is making handoffs explicit.'),
        (N'WF-X-POLICY-01', N'Validate Policy, Licensing and Compliance', N'Check the deal against policy before policy checks the deal.', N'Prescriptive', N'Published', N'FA-04', 30, N'Policy questions found at approval cost weeks; found early they cost a conversation. Interpretation belongs to authoritative sources, never to assumption.', N'A policy and licensing check with every open question routed to its authoritative owner.', N'Policy questions found early are conversations. Found at approval, they are delays.'),
        (N'WF-X-ASSET-01', N'Capture and Reuse What Works', N'Turn work already done into something the team can find and reuse.', N'Prescriptive', N'Published', N'FA-05', 30, N'Teams routinely rebuild work that already exists because nobody could find the original. Reuse is the cheapest productivity available to us.', N'One reusable asset captured with enough context that a colleague could pick it up unaided.', N'Most teams rebuild artifacts that already exist. Reuse is the cheapest productivity available.'),
        (N'WF-INVEST-01', N'Plan, Orchestrate and Realize Customer Investment', N'Plan, request, deliver and prove the value of customer investment across the roles that touch it.', N'Prescriptive', N'Published', N'FA-07', 30, N'Customer investment succeeds or fails on role clarity, evidence and clean handoffs. Every role owns one link, and the chain breaks where the handoff is vague.', N'An investment case moved to its next governed action, with the human decision and its owner named.', N'Investment succeeds on role clarity, evidence and clean handoffs. Every role owns one part of that chain.'),
        (N'WF-ORIENT-01', N'Frontier Accelerator Orientation', N'Introduces the motion, the huddle format, the AI tools in scope, and what team members are expected to try between sessions.', N'Prescriptive', N'Published', N'FA-00', 30, N'Eight weeks of huddles only works if everyone understands what is being asked, what good participation looks like, and where human judgment stays non-negotiable.', N'Every team member knows the format and the expectations, and leaves with one thing to try before the next session.', N'The point of the motion is better workflow with human judgment kept explicit, not tool adoption for its own sake.'),
        (N'WF-X-USECASE-01', N'Identify and Test an AI-Assisted Workflow', N'Surface a recurring workflow, choose the smallest useful AI-assisted step, and test it with clear evidence and human checkpoints.', N'Prescriptive', N'Published', N'FA-01', 30, N'Teams often wait for role-specific content when they could safely improve a real workflow using a reusable discovery and experiment pattern.', N'A prioritized workflow opportunity and a bounded experiment with inputs, expected output, success evidence, owner, and human checkpoint.', N'Start with the work, not the tool. A useful first experiment is narrow, observable, and easy to review.')
    ) v([ExternalId], [Name], [Description], [Type], [PublicationStatus], [FocusAreaExternalId], [DurationMinutes], [WhyItMatters], [DesiredOutcome], [KeyTakeaway])
), src AS (
    SELECT raw.*, fa.Id AS [HuddleFocusAreaId]
    FROM raw
    INNER JOIN dbo.HuddleFocusAreas AS fa ON fa.[ExternalId] = raw.[FocusAreaExternalId]
)
MERGE dbo.HuddleTopics AS tgt
USING src ON tgt.[ExternalId] = src.[ExternalId]
WHEN MATCHED THEN UPDATE SET
        tgt.[Name] = src.[Name],
        tgt.[Description] = src.[Description],
        tgt.[Type] = src.[Type],
        tgt.[PublicationStatus] = src.[PublicationStatus],
        tgt.[HuddleFocusAreaId] = src.[HuddleFocusAreaId],
        tgt.[DurationMinutes] = src.[DurationMinutes],
        tgt.[WhyItMatters] = src.[WhyItMatters],
        tgt.[DesiredOutcome] = src.[DesiredOutcome],
        tgt.[KeyTakeaway] = src.[KeyTakeaway],
        tgt.[UpdatedAtUtc] = SYSUTCDATETIME()
WHEN NOT MATCHED BY TARGET THEN INSERT ([ExternalId], [Name], [Description], [Type], [PublicationStatus], [HuddleFocusAreaId], [DurationMinutes], [WhyItMatters], [DesiredOutcome], [KeyTakeaway], [CreatedAtUtc])
    VALUES (src.[ExternalId], src.[Name], src.[Description], src.[Type], src.[PublicationStatus], src.[HuddleFocusAreaId], src.[DurationMinutes], src.[WhyItMatters], src.[DesiredOutcome], src.[KeyTakeaway], SYSUTCDATETIME());
;WITH raw AS (
    SELECT * FROM (VALUES
        (N'WF-X-PLAN-01', N'Prioritize and Plan the Account', N'Decide where attention goes across accounts, workloads or solutions, and turn that decision into a plan someone can act on.', N'Prescriptive', N'Published', N'FA-01', 30, N'Time is the scarcest resource in the week. Deciding where it goes on evidence, rather than by habit or by whoever asked last, is the difference between a quarter you shaped and one that happened to you.', N'A short, prioritized set of accounts, workloads or solution plays with a named next action and owner for each.', N'Prioritization is a decision about what you will not do. AI can assemble the evidence; the choice stays yours.'),
        (N'WF-X-PIPE-01', N'Inspect the Pipeline and Build the Forecast', N'Inspect what the data says, correct what misrepresents reality, and build a forecast you can defend.', N'Prescriptive', N'Published', N'FA-01', 30, N'Every forecast conversation, coverage review and consumption call rests on data somebody has to trust. When the underlying signal is wrong, everything built on it is guesswork wearing a number.', N'Corrected records and a defensible narrative that explains the position, the risk and what would close the gap.', N'A forecast is an argument, not a number. AI improves the evidence; it does not make the call.'),
        (N'WF-X-OPP-01', N'Create and Qualify Demand', N'Find the next real opportunity from signals already available, and qualify it on evidence rather than optimism.', N'Prescriptive', N'Published', N'FA-01', 30, N'Pipeline gaps are usually discovery gaps. The signals for the next opportunity are already sitting in accounts we own; the work is finding them on purpose rather than by luck.', N'At least one new qualified opportunity with a documented trigger and a tested reason it is real.', N'A pipeline gap is usually a discovery gap. Qualification is a test, not a stage.'),
        (N'WF-X-CONV-01', N'Prepare and Lead a Customer Conversation', N'Prepare for the conversation that moves the decision, anticipate what will be asked, and lead it with evidence.', N'Prescriptive', N'Published', N'FA-02', 30, N'Customer conversations are where decisions actually move. They are won or lost in preparation, and preparation is the first thing dropped when the calendar fills.', N'A prepared conversation with a stated intended outcome, the likely objections anticipated and the evidence ready.', N'Preparation is where the meeting is decided. AI makes good preparation fast enough to actually happen.'),
        (N'WF-X-ARCH-01', N'Design and Validate the Technical Solution', N'Design the solution, then prove it works well enough for the customer to decide.', N'Prescriptive', N'Published', N'FA-05', 30, N'A design the customer cannot see or test is a document. Proof is what converts technical work into a customer decision, and criteria set afterwards get argued about forever.', N'A validated design with explicit success and exit criteria the customer has agreed to.', N'A design nobody has argued against has not been validated. Proof is what converts a design into a decision.'),
        (N'WF-X-DISC-01', N'Lead Discovery and Define Decision Criteria', N'Understand the real problem and agree what would make the customer decide.', N'Prescriptive', N'Published', N'FA-05', 30, N'Discovery that ends without agreed decision criteria produces a second discovery meeting. The stated problem is rarely the real one.', N'A bounded problem statement, named evidence gaps and written decision criteria.', N'Discovery that does not end in decision criteria is a conversation, not discovery.'),
        (N'WF-X-HEALTH-01', N'Assess Health and Prioritize Risk', N'Find the risk that matters most right now, and decide what to do about it while it is still cheap.', N'Prescriptive', N'Published', N'FA-06', 30, N'Risk found early is a conversation. The same risk found late is an escalation with an audience. Scores tell us something is wrong; they rarely tell us what to do.', N'A ranked risk view with an owner, a date and one intervention already started.', N'Risk found early is a conversation. The same risk found late is an escalation.'),
        (N'WF-X-DEAL-01', N'Advance and Structure the Deal', N'Move the deal to its next decision, and structure it so it can actually be approved.', N'Prescriptive', N'Published', N'FA-03', 30, N'Deals stall on structure more often than on merit. The cost of discovering an approval requirement late is measured in weeks.', N'The next decision named, the blockers owned and a structure that can actually be approved.', N'Deals stall on structure more often than on merit. Getting the shape right early is the cheapest work available.'),
        (N'WF-X-VALUE-01', N'Prove and Communicate Value', N'Turn what has actually happened into a value story the customer recognizes and will act on.', N'Prescriptive', N'Published', N'FA-02', 30, N'Value that is not evidenced reads as opinion, and value never communicated is invisible at renewal. Customers judge us on outcomes they can see.', N'An evidence-based value story in the customer''s own terms, with gaps named honestly.', N'Value that is not evidenced is an opinion. Value that is not communicated is invisible.'),
        (N'WF-X-RENEW-01', N'Manage Renewal and Expansion', N'Protect the renewal and find the expansion that is already inside it.', N'Prescriptive', N'Published', N'FA-03', 30, N'A renewal is decided months before the date, usually by whether value was evidenced along the way. Expansion is easier to find inside a healthy renewal than outside one.', N'A renewal position with the largest risk named and one evidenced expansion hypothesis.', N'A renewal is decided months before the date. The work is in seeing the risk early enough to act.'),
        (N'WF-X-ORCH-01', N'Orchestrate the Team, Partners and Delivery', N'Get the right people moving on the right thing, and keep the handoffs clean enough to survive contact.', N'Prescriptive', N'Published', N'FA-07', 30, N'Most work stalls in the handoff, not the task. Account teams carry responsibility without authority, and explicit handoffs are the only reliable substitute.', N'A mobilized team with a named owner, input and date for every handoff, and stalled items escalated.', N'Most work stalls in the handoff, not in the task. Orchestration is making handoffs explicit.'),
        (N'WF-X-POLICY-01', N'Validate Policy, Licensing and Compliance', N'Check the deal against policy before policy checks the deal.', N'Prescriptive', N'Published', N'FA-04', 30, N'Policy questions found at approval cost weeks; found early they cost a conversation. Interpretation belongs to authoritative sources, never to assumption.', N'A policy and licensing check with every open question routed to its authoritative owner.', N'Policy questions found early are conversations. Found at approval, they are delays.'),
        (N'WF-X-ASSET-01', N'Capture and Reuse What Works', N'Turn work already done into something the team can find and reuse.', N'Prescriptive', N'Published', N'FA-05', 30, N'Teams routinely rebuild work that already exists because nobody could find the original. Reuse is the cheapest productivity available to us.', N'One reusable asset captured with enough context that a colleague could pick it up unaided.', N'Most teams rebuild artifacts that already exist. Reuse is the cheapest productivity available.'),
        (N'WF-INVEST-01', N'Plan, Orchestrate and Realize Customer Investment', N'Plan, request, deliver and prove the value of customer investment across the roles that touch it.', N'Prescriptive', N'Published', N'FA-07', 30, N'Customer investment succeeds or fails on role clarity, evidence and clean handoffs. Every role owns one link, and the chain breaks where the handoff is vague.', N'An investment case moved to its next governed action, with the human decision and its owner named.', N'Investment succeeds on role clarity, evidence and clean handoffs. Every role owns one part of that chain.'),
        (N'WF-ORIENT-01', N'Frontier Accelerator Orientation', N'Introduces the motion, the huddle format, the AI tools in scope, and what team members are expected to try between sessions.', N'Prescriptive', N'Published', N'FA-00', 30, N'Eight weeks of huddles only works if everyone understands what is being asked, what good participation looks like, and where human judgment stays non-negotiable.', N'Every team member knows the format and the expectations, and leaves with one thing to try before the next session.', N'The point of the motion is better workflow with human judgment kept explicit, not tool adoption for its own sake.'),
        (N'WF-X-USECASE-01', N'Identify and Test an AI-Assisted Workflow', N'Surface a recurring workflow, choose the smallest useful AI-assisted step, and test it with clear evidence and human checkpoints.', N'Prescriptive', N'Published', N'FA-01', 30, N'Teams often wait for role-specific content when they could safely improve a real workflow using a reusable discovery and experiment pattern.', N'A prioritized workflow opportunity and a bounded experiment with inputs, expected output, success evidence, owner, and human checkpoint.', N'Start with the work, not the tool. A useful first experiment is narrow, observable, and easy to review.')
    ) v([ExternalId], [Name], [Description], [Type], [PublicationStatus], [FocusAreaExternalId], [DurationMinutes], [WhyItMatters], [DesiredOutcome], [KeyTakeaway])
)
SELECT @unresolved = 16 - COUNT(*) FROM raw
    INNER JOIN dbo.HuddleFocusAreas AS fa ON fa.[ExternalId] = raw.[FocusAreaExternalId];
IF @unresolved <> 0
    THROW 51000, 'HuddleTopics: 16 source rows were expected to resolve their foreign keys but some did not. Run the earlier scripts in order and re-check the workbook.', 1;

-- Aligned roles, split from the semicolon-separated Topics.AlignedRoles column.
;WITH raw AS (
    SELECT * FROM (VALUES
        (N'WF-X-PLAN-01', N'AE'),
        (N'WF-X-PLAN-01', N'ATS'),
        (N'WF-X-PLAN-01', N'CSAM'),
        (N'WF-X-PLAN-01', N'SSP'),
        (N'WF-X-PIPE-01', N'AE'),
        (N'WF-X-PIPE-01', N'CSA'),
        (N'WF-X-OPP-01', N'AE'),
        (N'WF-X-OPP-01', N'SSP'),
        (N'WF-X-CONV-01', N'AE'),
        (N'WF-X-CONV-01', N'ATS'),
        (N'WF-X-CONV-01', N'CSA'),
        (N'WF-X-CONV-01', N'CSAM'),
        (N'WF-X-CONV-01', N'SE'),
        (N'WF-X-CONV-01', N'SSP'),
        (N'WF-X-ARCH-01', N'ATS'),
        (N'WF-X-ARCH-01', N'CSA'),
        (N'WF-X-ARCH-01', N'SE'),
        (N'WF-X-DISC-01', N'SE'),
        (N'WF-X-HEALTH-01', N'ATS'),
        (N'WF-X-HEALTH-01', N'CE'),
        (N'WF-X-HEALTH-01', N'CSA'),
        (N'WF-X-HEALTH-01', N'CSAM'),
        (N'WF-X-HEALTH-01', N'SE'),
        (N'WF-X-DEAL-01', N'AE'),
        (N'WF-X-DEAL-01', N'ALL'),
        (N'WF-X-DEAL-01', N'CE'),
        (N'WF-X-DEAL-01', N'SSP'),
        (N'WF-X-VALUE-01', N'AE'),
        (N'WF-X-VALUE-01', N'ATS'),
        (N'WF-X-VALUE-01', N'CSA'),
        (N'WF-X-VALUE-01', N'CSAM'),
        (N'WF-X-VALUE-01', N'SSP'),
        (N'WF-X-RENEW-01', N'AE'),
        (N'WF-X-RENEW-01', N'CE'),
        (N'WF-X-RENEW-01', N'CSAM'),
        (N'WF-X-ORCH-01', N'AE'),
        (N'WF-X-ORCH-01', N'ATS'),
        (N'WF-X-ORCH-01', N'CE'),
        (N'WF-X-ORCH-01', N'CSAM'),
        (N'WF-X-ORCH-01', N'SSP'),
        (N'WF-X-POLICY-01', N'CE'),
        (N'WF-X-ASSET-01', N'SE'),
        (N'WF-INVEST-01', N'AE'),
        (N'WF-INVEST-01', N'ATS'),
        (N'WF-INVEST-01', N'CE'),
        (N'WF-INVEST-01', N'CSA'),
        (N'WF-INVEST-01', N'CSAM'),
        (N'WF-INVEST-01', N'SE'),
        (N'WF-INVEST-01', N'SSP'),
        (N'WF-ORIENT-01', N'AE'),
        (N'WF-ORIENT-01', N'ATS'),
        (N'WF-ORIENT-01', N'CE'),
        (N'WF-ORIENT-01', N'CSA'),
        (N'WF-ORIENT-01', N'CSAM'),
        (N'WF-ORIENT-01', N'SE'),
        (N'WF-ORIENT-01', N'SSP'),
        (N'WF-X-USECASE-01', N'ALL')
    ) v([TopicExternalId], [RoleAbbreviation])
), src AS (
    SELECT raw.*, t.Id AS [HuddleTopicId], rl.Id AS [RoleId]
    FROM raw
    INNER JOIN dbo.HuddleTopics AS t ON t.[ExternalId] = raw.[TopicExternalId]
    INNER JOIN dbo.Roles AS rl ON rl.[Abbreviation] = raw.[RoleAbbreviation]
)
MERGE dbo.HuddleTopicRoles AS tgt
USING src ON tgt.[HuddleTopicId] = src.[HuddleTopicId] AND tgt.[RoleId] = src.[RoleId]
WHEN NOT MATCHED BY TARGET THEN INSERT ([HuddleTopicId], [RoleId])
    VALUES (src.[HuddleTopicId], src.[RoleId]);
;WITH raw AS (
    SELECT * FROM (VALUES
        (N'WF-X-PLAN-01', N'AE'),
        (N'WF-X-PLAN-01', N'ATS'),
        (N'WF-X-PLAN-01', N'CSAM'),
        (N'WF-X-PLAN-01', N'SSP'),
        (N'WF-X-PIPE-01', N'AE'),
        (N'WF-X-PIPE-01', N'CSA'),
        (N'WF-X-OPP-01', N'AE'),
        (N'WF-X-OPP-01', N'SSP'),
        (N'WF-X-CONV-01', N'AE'),
        (N'WF-X-CONV-01', N'ATS'),
        (N'WF-X-CONV-01', N'CSA'),
        (N'WF-X-CONV-01', N'CSAM'),
        (N'WF-X-CONV-01', N'SE'),
        (N'WF-X-CONV-01', N'SSP'),
        (N'WF-X-ARCH-01', N'ATS'),
        (N'WF-X-ARCH-01', N'CSA'),
        (N'WF-X-ARCH-01', N'SE'),
        (N'WF-X-DISC-01', N'SE'),
        (N'WF-X-HEALTH-01', N'ATS'),
        (N'WF-X-HEALTH-01', N'CE'),
        (N'WF-X-HEALTH-01', N'CSA'),
        (N'WF-X-HEALTH-01', N'CSAM'),
        (N'WF-X-HEALTH-01', N'SE'),
        (N'WF-X-DEAL-01', N'AE'),
        (N'WF-X-DEAL-01', N'ALL'),
        (N'WF-X-DEAL-01', N'CE'),
        (N'WF-X-DEAL-01', N'SSP'),
        (N'WF-X-VALUE-01', N'AE'),
        (N'WF-X-VALUE-01', N'ATS'),
        (N'WF-X-VALUE-01', N'CSA'),
        (N'WF-X-VALUE-01', N'CSAM'),
        (N'WF-X-VALUE-01', N'SSP'),
        (N'WF-X-RENEW-01', N'AE'),
        (N'WF-X-RENEW-01', N'CE'),
        (N'WF-X-RENEW-01', N'CSAM'),
        (N'WF-X-ORCH-01', N'AE'),
        (N'WF-X-ORCH-01', N'ATS'),
        (N'WF-X-ORCH-01', N'CE'),
        (N'WF-X-ORCH-01', N'CSAM'),
        (N'WF-X-ORCH-01', N'SSP'),
        (N'WF-X-POLICY-01', N'CE'),
        (N'WF-X-ASSET-01', N'SE'),
        (N'WF-INVEST-01', N'AE'),
        (N'WF-INVEST-01', N'ATS'),
        (N'WF-INVEST-01', N'CE'),
        (N'WF-INVEST-01', N'CSA'),
        (N'WF-INVEST-01', N'CSAM'),
        (N'WF-INVEST-01', N'SE'),
        (N'WF-INVEST-01', N'SSP'),
        (N'WF-ORIENT-01', N'AE'),
        (N'WF-ORIENT-01', N'ATS'),
        (N'WF-ORIENT-01', N'CE'),
        (N'WF-ORIENT-01', N'CSA'),
        (N'WF-ORIENT-01', N'CSAM'),
        (N'WF-ORIENT-01', N'SE'),
        (N'WF-ORIENT-01', N'SSP'),
        (N'WF-X-USECASE-01', N'ALL')
    ) v([TopicExternalId], [RoleAbbreviation])
)
SELECT @unresolved = 57 - COUNT(*) FROM raw
    INNER JOIN dbo.HuddleTopics AS t ON t.[ExternalId] = raw.[TopicExternalId]
    INNER JOIN dbo.Roles AS rl ON rl.[Abbreviation] = raw.[RoleAbbreviation];
IF @unresolved <> 0
    THROW 51000, 'HuddleTopicRoles: 57 source rows were expected to resolve their foreign keys but some did not. Run the earlier scripts in order and re-check the workbook.', 1;

COMMIT TRANSACTION;
GO
