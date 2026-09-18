
SET NOCOUNT ON;
SET XACT_ABORT ON;
DECLARE @unresolved INT;
BEGIN TRANSACTION;

;WITH raw AS (
    SELECT * FROM (VALUES
        (N'WF-X-VSAT-01', N'Earn Customer Satisfaction on Every Delivery', N'Treat customer satisfaction as something evidenced and acted on during delivery, rather than discovered when the survey comes back.', N'Prescriptive', N'Published', N'FA-06', 30, N'A low score is rarely a surprise to the customer, only to us. The dissatisfaction was visible during delivery, and nobody named it while there was still time to act.', N'One satisfaction risk named with evidence, and one action taken before the survey window closes.', N'Satisfaction is decided long before the survey. The signals are there during delivery if you go looking for them.'),
        (N'WF-X-TECHLEAD-01', N'Build the Technical Credibility the Role Depends On', N'Close the distance between what the customer needs you to be credible on and what you can speak to today, deliberately rather than accidentally.', N'Prescriptive', N'Published', N'FA-05', 30, N'Customers decide early whether you are the person they call. That decision rests on whether you can speak to what they are building, not on your title.', N'One named gap between what the customer will need and what you can currently defend, with a specific way to close it.', N'Technical credibility is the currency of the role. It gets built on purpose or not at all.')
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
        (N'WF-X-VSAT-01', N'Earn Customer Satisfaction on Every Delivery', N'Treat customer satisfaction as something evidenced and acted on during delivery, rather than discovered when the survey comes back.', N'Prescriptive', N'Published', N'FA-06', 30, N'A low score is rarely a surprise to the customer, only to us. The dissatisfaction was visible during delivery, and nobody named it while there was still time to act.', N'One satisfaction risk named with evidence, and one action taken before the survey window closes.', N'Satisfaction is decided long before the survey. The signals are there during delivery if you go looking for them.'),
        (N'WF-X-TECHLEAD-01', N'Build the Technical Credibility the Role Depends On', N'Close the distance between what the customer needs you to be credible on and what you can speak to today, deliberately rather than accidentally.', N'Prescriptive', N'Published', N'FA-05', 30, N'Customers decide early whether you are the person they call. That decision rests on whether you can speak to what they are building, not on your title.', N'One named gap between what the customer will need and what you can currently defend, with a specific way to close it.', N'Technical credibility is the currency of the role. It gets built on purpose or not at all.')
    ) v([ExternalId], [Name], [Description], [Type], [PublicationStatus], [FocusAreaExternalId], [DurationMinutes], [WhyItMatters], [DesiredOutcome], [KeyTakeaway])
)
SELECT @unresolved = 2 - COUNT(*) FROM raw
    INNER JOIN dbo.HuddleFocusAreas AS fa ON fa.[ExternalId] = raw.[FocusAreaExternalId];
IF @unresolved <> 0
    THROW 51000, 'HuddleTopics (new): 2 source rows were expected to resolve their foreign keys but some did not. Run the earlier scripts in order and re-check the workbook.', 1;

-- New (TopicID,RoleID) pairs for HuddleTopicRoles -- includes existing topics that gained
-- an aligned role now that ROLE-SMEC-CE exists (a pure junction table, so this is a safe insert).
;WITH raw AS (
    SELECT * FROM (VALUES
        (N'WF-INVEST-01', N'ROLE-DAE'),
        (N'WF-INVEST-01', N'ROLE-DCSA'),
        (N'WF-INVEST-01', N'ROLE-DSE'),
        (N'WF-INVEST-01', N'ROLE-DSS'),
        (N'WF-INVEST-01', N'ROLE-PSS'),
        (N'WF-INVEST-01', N'ROLE-SMEC-CE'),
        (N'WF-ORIENT-01', N'ROLE-DCSA'),
        (N'WF-ORIENT-01', N'ROLE-DSE'),
        (N'WF-ORIENT-01', N'ROLE-PSS'),
        (N'WF-ORIENT-01', N'ROLE-SMEC-CE'),
        (N'WF-X-ARCH-01', N'ROLE-DCSA'),
        (N'WF-X-ASSET-01', N'ROLE-DSE'),
        (N'WF-X-CLOSE-01', N'ROLE-CSA'),
        (N'WF-X-CLOSE-01', N'ROLE-SE'),
        (N'WF-X-CONV-01', N'ROLE-DCSA'),
        (N'WF-X-CONV-01', N'ROLE-DSE'),
        (N'WF-X-CONV-01', N'ROLE-PSS'),
        (N'WF-X-DEAL-01', N'ROLE-SMEC-CE'),
        (N'WF-X-DISC-01', N'ROLE-DSE'),
        (N'WF-X-FYPLAN-01', N'ROLE-CSA'),
        (N'WF-X-FYPLAN-01', N'ROLE-CSAM'),
        (N'WF-X-FYPLAN-01', N'ROLE-SE'),
        (N'WF-X-HANDOFF-01', N'ROLE-CE'),
        (N'WF-X-HEALTH-01', N'ROLE-DCSA'),
        (N'WF-X-HEALTH-01', N'ROLE-DSE'),
        (N'WF-X-HEALTH-01', N'ROLE-PSS'),
        (N'WF-X-HEALTH-01', N'ROLE-SMEC-CE'),
        (N'WF-X-OPP-01', N'ROLE-PSS'),
        (N'WF-X-ORCH-01', N'ROLE-DSE'),
        (N'WF-X-ORCH-01', N'ROLE-DSS'),
        (N'WF-X-ORCH-01', N'ROLE-PSS'),
        (N'WF-X-ORCH-01', N'ROLE-SMEC-CE'),
        (N'WF-X-PARTNER-01', N'ROLE-DCSA'),
        (N'WF-X-PIPE-01', N'ROLE-ATS'),
        (N'WF-X-PIPE-01', N'ROLE-CE'),
        (N'WF-X-PIPE-01', N'ROLE-CSA'),
        (N'WF-X-PIPE-01', N'ROLE-CSAM'),
        (N'WF-X-PIPE-01', N'ROLE-SE'),
        (N'WF-X-PIPE-01', N'ROLE-SSP'),
        (N'WF-X-POLICY-01', N'ROLE-SMEC-CE'),
        (N'WF-X-RENEW-01', N'ROLE-DCSA'),
        (N'WF-X-RENEW-01', N'ROLE-SMEC-CE'),
        (N'WF-X-SPONSOR-01', N'ROLE-CE'),
        (N'WF-X-SPONSOR-01', N'ROLE-CSA'),
        (N'WF-X-SPONSOR-01', N'ROLE-SE'),
        (N'WF-X-TECHLEAD-01', N'ROLE-CSA'),
        (N'WF-X-TRANSITION-01', N'ROLE-CE'),
        (N'WF-X-TRANSITION-01', N'ROLE-CSA'),
        (N'WF-X-TRANSITION-01', N'ROLE-SE'),
        (N'WF-X-VALUE-01', N'ROLE-DCSA'),
        (N'WF-X-VALUE-01', N'ROLE-PSS'),
        (N'WF-X-VSAT-01', N'ROLE-CSA')
    ) v([TopicExternalId], [RoleExternalId])
), src AS (
    SELECT raw.*, t.Id AS [HuddleTopicId], rl.Id AS [RoleId]
    FROM raw
    INNER JOIN dbo.HuddleTopics AS t ON t.[ExternalId] = raw.[TopicExternalId]
    INNER JOIN dbo.Roles AS rl ON rl.[ExternalId] = raw.[RoleExternalId]
)
MERGE dbo.HuddleTopicRoles AS tgt
USING src ON tgt.[HuddleTopicId] = src.[HuddleTopicId] AND tgt.[RoleId] = src.[RoleId]
WHEN NOT MATCHED BY TARGET THEN INSERT ([HuddleTopicId], [RoleId])
    VALUES (src.[HuddleTopicId], src.[RoleId]);
;WITH raw AS (
    SELECT * FROM (VALUES
        (N'WF-INVEST-01', N'ROLE-DAE'),
        (N'WF-INVEST-01', N'ROLE-DCSA'),
        (N'WF-INVEST-01', N'ROLE-DSE'),
        (N'WF-INVEST-01', N'ROLE-DSS'),
        (N'WF-INVEST-01', N'ROLE-PSS'),
        (N'WF-INVEST-01', N'ROLE-SMEC-CE'),
        (N'WF-ORIENT-01', N'ROLE-DCSA'),
        (N'WF-ORIENT-01', N'ROLE-DSE'),
        (N'WF-ORIENT-01', N'ROLE-PSS'),
        (N'WF-ORIENT-01', N'ROLE-SMEC-CE'),
        (N'WF-X-ARCH-01', N'ROLE-DCSA'),
        (N'WF-X-ASSET-01', N'ROLE-DSE'),
        (N'WF-X-CLOSE-01', N'ROLE-CSA'),
        (N'WF-X-CLOSE-01', N'ROLE-SE'),
        (N'WF-X-CONV-01', N'ROLE-DCSA'),
        (N'WF-X-CONV-01', N'ROLE-DSE'),
        (N'WF-X-CONV-01', N'ROLE-PSS'),
        (N'WF-X-DEAL-01', N'ROLE-SMEC-CE'),
        (N'WF-X-DISC-01', N'ROLE-DSE'),
        (N'WF-X-FYPLAN-01', N'ROLE-CSA'),
        (N'WF-X-FYPLAN-01', N'ROLE-CSAM'),
        (N'WF-X-FYPLAN-01', N'ROLE-SE'),
        (N'WF-X-HANDOFF-01', N'ROLE-CE'),
        (N'WF-X-HEALTH-01', N'ROLE-DCSA'),
        (N'WF-X-HEALTH-01', N'ROLE-DSE'),
        (N'WF-X-HEALTH-01', N'ROLE-PSS'),
        (N'WF-X-HEALTH-01', N'ROLE-SMEC-CE'),
        (N'WF-X-OPP-01', N'ROLE-PSS'),
        (N'WF-X-ORCH-01', N'ROLE-DSE'),
        (N'WF-X-ORCH-01', N'ROLE-DSS'),
        (N'WF-X-ORCH-01', N'ROLE-PSS'),
        (N'WF-X-ORCH-01', N'ROLE-SMEC-CE'),
        (N'WF-X-PARTNER-01', N'ROLE-DCSA'),
        (N'WF-X-PIPE-01', N'ROLE-ATS'),
        (N'WF-X-PIPE-01', N'ROLE-CE'),
        (N'WF-X-PIPE-01', N'ROLE-CSA'),
        (N'WF-X-PIPE-01', N'ROLE-CSAM'),
        (N'WF-X-PIPE-01', N'ROLE-SE'),
        (N'WF-X-PIPE-01', N'ROLE-SSP'),
        (N'WF-X-POLICY-01', N'ROLE-SMEC-CE'),
        (N'WF-X-RENEW-01', N'ROLE-DCSA'),
        (N'WF-X-RENEW-01', N'ROLE-SMEC-CE'),
        (N'WF-X-SPONSOR-01', N'ROLE-CE'),
        (N'WF-X-SPONSOR-01', N'ROLE-CSA'),
        (N'WF-X-SPONSOR-01', N'ROLE-SE'),
        (N'WF-X-TECHLEAD-01', N'ROLE-CSA'),
        (N'WF-X-TRANSITION-01', N'ROLE-CE'),
        (N'WF-X-TRANSITION-01', N'ROLE-CSA'),
        (N'WF-X-TRANSITION-01', N'ROLE-SE'),
        (N'WF-X-VALUE-01', N'ROLE-DCSA'),
        (N'WF-X-VALUE-01', N'ROLE-PSS'),
        (N'WF-X-VSAT-01', N'ROLE-CSA')
    ) v([TopicExternalId], [RoleExternalId])
)
SELECT @unresolved = 52 - COUNT(*) FROM raw
    INNER JOIN dbo.HuddleTopics AS t ON t.[ExternalId] = raw.[TopicExternalId]
    INNER JOIN dbo.Roles AS rl ON rl.[ExternalId] = raw.[RoleExternalId];
IF @unresolved <> 0
    THROW 51000, 'HuddleTopicRoles (new): 52 source rows were expected to resolve their foreign keys but some did not. Run the earlier scripts in order and re-check the workbook.', 1;

COMMIT TRANSACTION;
GO
