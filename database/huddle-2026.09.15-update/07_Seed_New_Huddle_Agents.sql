
SET NOCOUNT ON;
SET XACT_ABORT ON;
DECLARE @unresolved INT;
BEGIN TRANSACTION;

;WITH raw AS (
    SELECT * FROM (VALUES
        (N'AGT-013', N'Sales Home', N'The seller landing surface inside Sales Agent, opened from Microsoft 365 Copilot. It brings your alerts and quota attainment, your prospecting signals and your pipeline into one place, and answers questions against what MSX holds. It is in preview for SME&C sellers on MSX and is enabled for individual contributors, not managers.', N'Seller surface within Sales Agent', N'Pull the real state of an opportunity out of MSX and read it back plainly: the current stage and when it last moved, the recorded next step and who owns it, the close date and what supports it, and any blocker or objection captured against the account. It works across your whole book, so you can ask which opportunities in your solution area have a named competitor recorded, which partners keep letting co-sell records lapse, or which accounts already carry a discount or non-standard term. It also drafts first-touch outreach to contacts that already exist in MSX, in English.', N'Use it when the question is what is on the record. Deal preparation, pressure-testing a close date, working your prospecting signals, checking the concessions already in force on an account before you negotiate, or finding the other opportunities where this same objection has already come up. Reach for it first whenever you would otherwise open MSX and click through an opportunity by hand. If Sales Home has not been turned on for you, Sales Accelerator covers the same prospecting and signal work and is where your queue lives. Sales Agent is the wider conversational surface that Sales Home sits inside, so if you are already in a Sales Agent chat you do not need to switch.', N'Sales Home is in preview for SME&C sellers who use MSX, and is enabled for individual contributors only - managers will not see it. Renewal, Campaign, Planning, Realization and Deal Agent integration are roadmap, not available today, so do not build an activity that depends on them.', N'Opens Sales Agent. Sales Home is the seller surface inside it - My View for alerts and quota attainment, Prospecting for signals, account research, contacts and outreach, and Pipeline for opportunities, forecast comments, close plans and deal risks. It is not a separate product and has no separate link.', N'Replaces the click-through: stage, next step, owner, close date and open objection come back in one answer instead of four screens in MSX. Because it reads across your whole book at once, questions that used to mean opening opportunities one at a time, such as where a competitor has shown up, which partners keep lapsing, or what you have already conceded on an account, become a single prompt. Most usefully, it shows you where the record is empty, which is normally the thing costing you the deal.', N'https://m365.cloud.microsoft/chat/?titleId=P_280ba0c3-7951-e7a8-68d3-8d65f9ca8149', N'Open Sales Agent'),
        (N'AGT-014', N'Know Your Partner', NULL, N'Domain agent', NULL, NULL, NULL, N'Opens the Know Your Partner app details page in Teams via the owner-maintained alias. Install the app once and it stays in your Teams rail.', NULL, N'https://aka.ms/KnowYourPartner', N'Open Know Your Partner'),
        (N'AGT-015', N'GitHub Copilot', N'AI pair programmer available in VS Code, the CLI and the GitHub Copilot app. It works against a repository or a working folder rather than against your mail and meetings.', N'Coding agent', N'Write, explain, refactor and test code; scaffold infrastructure-as-code and deployment artifacts; build the smallest spike that proves or disproves an architecture assumption; generate sample data and validation scripts; and reproduce a reported failure so you can see it rather than describe it.', N'When the next step is to build something rather than to plan or describe it. Validating an architecture assumption with a spike, standing up a demo or workshop environment, iterating a proof of concept, reproducing a deployment or integration failure, or packaging a reusable asset with tests and setup steps.', N'Do not use it for customer, market or account research; that is Researcher. Do not use it to assemble a customer-facing document or deck; that is Cowork. Do not point it at production without the review your team already requires, and do not paste customer data into it. It works on code and configuration, not on the CRM record.', N'Use it where the code already is: the Copilot extension in VS Code, the gh copilot CLI, or the GitHub Copilot app in the browser for work not tied to a local checkout. Open the repository or folder first so it has the context. Start with: Explain what this deployment does, then write the smallest test that would prove the assumption I am least sure about.', N'Turns a technical opinion into evidence. A spike that takes twenty minutes settles an argument that would otherwise run for a week, and a reproduced failure is a fact the account team can act on rather than a claim the customer has to accept.', N'https://github.com/copilot', N'Open GitHub Copilot')
    ) v([ExternalId], [Name], [ShortDescription], [WhatItIs], [WhatItHelpsYouDo], [WhenToUseIt], [WhenNotToUseIt], [StepsToGetStarted], [KeyBenefits], [AccessUrl], [AccessLinkLabel])
), src AS (
    SELECT raw.*
    FROM raw
)
MERGE dbo.HuddleAgents AS tgt
USING src ON tgt.[ExternalId] = src.[ExternalId]
WHEN MATCHED THEN UPDATE SET
        tgt.[Name] = src.[Name],
        tgt.[ShortDescription] = src.[ShortDescription],
        tgt.[WhatItIs] = src.[WhatItIs],
        tgt.[WhatItHelpsYouDo] = src.[WhatItHelpsYouDo],
        tgt.[WhenToUseIt] = src.[WhenToUseIt],
        tgt.[WhenNotToUseIt] = src.[WhenNotToUseIt],
        tgt.[StepsToGetStarted] = src.[StepsToGetStarted],
        tgt.[KeyBenefits] = src.[KeyBenefits],
        tgt.[AccessUrl] = src.[AccessUrl],
        tgt.[AccessLinkLabel] = src.[AccessLinkLabel],
        tgt.[UpdatedAtUtc] = SYSUTCDATETIME()
WHEN NOT MATCHED BY TARGET THEN INSERT ([ExternalId], [Name], [ShortDescription], [WhatItIs], [WhatItHelpsYouDo], [WhenToUseIt], [WhenNotToUseIt], [StepsToGetStarted], [KeyBenefits], [AccessUrl], [AccessLinkLabel], [CreatedAtUtc])
    VALUES (src.[ExternalId], src.[Name], src.[ShortDescription], src.[WhatItIs], src.[WhatItHelpsYouDo], src.[WhenToUseIt], src.[WhenNotToUseIt], src.[StepsToGetStarted], src.[KeyBenefits], src.[AccessUrl], src.[AccessLinkLabel], SYSUTCDATETIME());

COMMIT TRANSACTION;
GO
