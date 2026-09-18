/*
    New AI agent: Deal Agent (AGT-016), catalog ID added in the 9.16.2026 Frontier Accelerator
    workbook (V11.78 correction, 2026-09-16). Deal Agent previously had no AgentID -- it was
    represented only through DisplayLabel text on Activity_Agents/Agent_Resources rows pointing
    at AGT-001 (Sales Agent). AGT-016 gives it explicit catalog attribution while it remains a
    skill surfaced through Sales Agent, not a standalone agent (AccessUrl/AccessLinkLabel still
    route through Sales Agent).
    Compared against fresh-install-v11.78/25_Huddle_Agents.sql: AGT-016 does not exist there or
    in any other database script inspected. Genuinely new row.
    Do not hand-edit. Re-runnable: this is the same ExternalId-keyed MERGE pattern already used in
    25_Huddle_Agents.sql, scoped to only this new row.
*/
SET NOCOUNT ON;
SET XACT_ABORT ON;
BEGIN TRANSACTION;

;WITH raw AS (
    SELECT * FROM (VALUES
        (N'AGT-016', N'Deal Agent', N'Deal Agent is surfaced through Sales Agent. It is not a standalone agent to install or select; it triggers automatically when you ask about a renewal or a deal.', N'Surfaced through Sales Agent (not standalone)', N'Support enterprise renewals and deal work: deal discovery and history, Deal Book generation, EA quotes and proposals, amendments, pre-approvals, and licensing questions. Retrieve agreement, enrollment, license-estate, and consumption context through Sales Agent.', N'For renewals and deals, ask about enrollments, renewal agreements, agreement summaries, license estate, Azure consumption against commitment, Deal Books, EA quotes, proposals, amendments, and pre-approvals. EA and MCA-E renewals are the primary motion. Lead with an identifier such as a TPID, agreement number, or enrollment number; specific prompts return real deal data and vague prompts return generic answers.', N'Do not treat Deal Agent as a separate agent to select; it is a skill inside Sales Chat. Do not rely on it alone for complex negotiations or sensitive disclosures, and do not bypass the legal approval chain for material amendments. Do not treat a first response as final on a complex deal; re-run and verify against current data. Do not use it for work outside the CRM such as decks, emails, and documents; that is Cowork. When it offers a confirmation card before creating or changing an MSX record, read what it is about to write rather than confirming by reflex - nothing is committed until you tap, and that tap is the only check on it.', N'Open Microsoft 365 Copilot and use the agent picker to select Sales. Start a new chat with a renewal or deal question, such as: List my upcoming renewals this quarter. Deal Agent triggers automatically; there is nothing separate to install or select. Lead with a TPID, agreement number, or enrollment number, keep one chat thread per deal, and review returned facts and proposed actions before using them.', N'Brings deal facts, renewal context, Deal Books, and proposal work into the Sales Agent conversation instead of gathering them across separate portals. Keeps the capability visible while retaining one entry point and human review of commercial decisions.', N'https://m365.cloud.microsoft/chat/?titleId=P_280ba0c3-7951-e7a8-68d3-8d65f9ca8149', N'Open Sales Agent for Deal Agent')
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
