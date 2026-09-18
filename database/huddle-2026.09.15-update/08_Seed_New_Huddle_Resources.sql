SET NOCOUNT ON;
SET XACT_ABORT ON;
DECLARE @unresolved INT;
BEGIN TRANSACTION;

;WITH raw AS (
    SELECT * FROM (VALUES
        (N'RES-SALESHOME', N'Sales Home (SME&C Hub)', N'The SME&C seller surface inside Sales Agent. Covers My View, Prospecting and Pipeline today, with Campaign, Planning, Renewal and Realization & Usage on the roadmap. Sales Home is part of Sales Agent rather than a separate product, and works alongside chat rather than replacing it. In preview for SME&C individual contributors since late July 2026; it does not replace MSX.', N'https://microsoft.sharepoint.com/teams/SMEC_Hub/SitePages/Sales-Home.aspx', NULL, NULL, 0),
        (N'RES-KYP', N'Know Your Partner Agent', N'SME&C partner briefing agent. Assembles partner performance from Partner IAP (ACR, CSP, Copilot seats, net new revenue) and program utilization from Activities Utilization ROB (Azure, Copilot and Security Accelerate), then adds web-sourced partner news and situational fluency. Type a partner name or PartnerOne ID; name several to compare. States placeholders rather than inventing missing data.', N'https://aka.ms/KnowYourPartner', NULL, NULL, 0),
        (N'RES-GLOBAL-03', N'Microsoft AI-Powered Selling (MAPS)', N'Optional MCAPS Academy resource for additional learning about AI-powered selling, with role-based courses. Separate from the huddle motion.', N'https://microsoft.sharepoint.com/teams/MCAPSAcademy/SitePages/Microsoft-AI-Powered-Selling.aspx', N'Learning program', N'Explore MAPS learning', 1)
    ) v([ExternalId], [Title], [Description], [Url], [Type], [LinkLabel], [IsGlobal])
), src AS (
    SELECT raw.*
    FROM raw
)
MERGE dbo.HuddleResources AS tgt
USING src ON tgt.[ExternalId] = src.[ExternalId]
WHEN MATCHED THEN UPDATE SET
        tgt.[Title] = src.[Title],
        tgt.[Description] = src.[Description],
        tgt.[Url] = src.[Url],
        tgt.[Type] = src.[Type],
        tgt.[LinkLabel] = src.[LinkLabel],
        tgt.[IsGlobal] = src.[IsGlobal],
        tgt.[UpdatedAtUtc] = SYSUTCDATETIME()
WHEN NOT MATCHED BY TARGET THEN INSERT ([ExternalId], [Title], [Description], [Url], [Type], [LinkLabel], [IsGlobal], [CreatedAtUtc])
    VALUES (src.[ExternalId], src.[Title], src.[Description], src.[Url], src.[Type], src.[LinkLabel], src.[IsGlobal], SYSUTCDATETIME());

COMMIT TRANSACTION;
GO
