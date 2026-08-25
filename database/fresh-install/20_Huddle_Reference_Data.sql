/*
    Segments, roles, segment roles, focus areas and MCEM stages
    Generated from the Frontier Accelerator content workbook by generate.py.
    Do not hand-edit. Re-runnable: every statement is an ExternalId-keyed MERGE, nothing is deleted.
*/
SET NOCOUNT ON;
SET XACT_ABORT ON;
DECLARE @unresolved INT;
BEGIN TRANSACTION;

-- Segments
;WITH raw AS (
    SELECT * FROM (VALUES
        (N'SEG-ENT', N'Enterprise')
    ) v([ExternalId], [Name])
), src AS (
    SELECT raw.*
    FROM raw
)
MERGE dbo.HuddleSegments AS tgt
USING src ON tgt.[ExternalId] = src.[ExternalId]
WHEN MATCHED THEN UPDATE SET
        tgt.[Name] = src.[Name],
        tgt.[UpdatedAtUtc] = SYSUTCDATETIME()
WHEN NOT MATCHED BY TARGET THEN INSERT ([ExternalId], [Name], [CreatedAtUtc])
    VALUES (src.[ExternalId], src.[Name], SYSUTCDATETIME());

-- Roles are matched on Abbreviation, not ExternalId. The pre-V4 seed uses ExternalIds like
-- ae-ent while the workbook uses ROLE-AE, so keying on ExternalId would insert a second row
-- per role rather than updating the existing one. Abbreviation is what both share.
-- ExternalId is insert-only: an existing role keeps its own, because the Workflow feature
-- references these rows through Activities.RoleId and the frontend keys icons off them.
;WITH raw AS (
    SELECT * FROM (VALUES
        (N'ROLE-AE', N'Account Executive', N'AE', N'Enterprise', 1, 1),
        (N'ROLE-ATS', N'Account Technology Strategist', N'ATS', N'Enterprise', 2, 1),
        (N'ROLE-SSP', N'Solution Sales Professional', N'SSP', N'Enterprise', 3, 1),
        (N'ROLE-SE', N'Solution Engineer', N'SE', N'Enterprise', 4, 1),
        (N'ROLE-CE', N'Commercial Executive', N'CE', N'Enterprise', 5, 1),
        (N'ROLE-CSA', N'Cloud Solution Architect', N'CSA', N'Enterprise', 6, 1),
        (N'ROLE-CSAM', N'Customer Success Account Manager', N'CSAM', N'Enterprise', 7, 1),
        (N'ROLE-ALL', N'All Roles', N'ALL', N'Enterprise', 8, 1)
    ) v([ExternalId], [Name], [Abbreviation], [Segment], [SortOrder], [IsActive])
), src AS (
    SELECT raw.*
    FROM raw
)
MERGE dbo.Roles AS tgt
USING src ON tgt.[Abbreviation] = src.[Abbreviation]
WHEN MATCHED THEN UPDATE SET
        tgt.[Name] = src.[Name],
        tgt.[Segment] = src.[Segment],
        tgt.[SortOrder] = src.[SortOrder],
        tgt.[IsActive] = src.[IsActive],
        tgt.[UpdatedAtUtc] = SYSUTCDATETIME()
WHEN NOT MATCHED BY TARGET THEN INSERT ([ExternalId], [Name], [Abbreviation], [Segment], [SortOrder], [IsActive], [CreatedAtUtc])
    VALUES (src.[ExternalId], src.[Name], src.[Abbreviation], src.[Segment], src.[SortOrder], src.[IsActive], SYSUTCDATETIME());

-- Segment roles. Resolves the role by Abbreviation for the same reason as above.
;WITH raw AS (
    SELECT * FROM (VALUES
        (N'SR-ENT-AE', N'SEG-ENT', N'AE', N'Account Executive'),
        (N'SR-ENT-ATS', N'SEG-ENT', N'ATS', N'Account Technology Strategist'),
        (N'SR-ENT-SSP', N'SEG-ENT', N'SSP', N'Solution Sales Professional'),
        (N'SR-ENT-SE', N'SEG-ENT', N'SE', N'Solution Engineer'),
        (N'SR-ENT-CE', N'SEG-ENT', N'CE', N'Commercial Executive'),
        (N'SR-ENT-CSA', N'SEG-ENT', N'CSA', N'Cloud Solution Architect'),
        (N'SR-ENT-CSAM', N'SEG-ENT', N'CSAM', N'Customer Success Account Manager'),
        (N'SR-ENT-ALL', N'SEG-ENT', N'ALL', N'All Roles')
    ) v([ExternalId], [SegmentExternalId], [RoleAbbreviation], [DisplayName])
), src AS (
    SELECT raw.*, sg.Id AS [HuddleSegmentId], rl.Id AS [RoleId]
    FROM raw
    INNER JOIN dbo.HuddleSegments AS sg ON sg.[ExternalId] = raw.[SegmentExternalId]
    INNER JOIN dbo.Roles AS rl ON rl.[Abbreviation] = raw.[RoleAbbreviation]
)
MERGE dbo.HuddleSegmentRoles AS tgt
USING src ON tgt.[ExternalId] = src.[ExternalId]
WHEN MATCHED THEN UPDATE SET
        tgt.[HuddleSegmentId] = src.[HuddleSegmentId],
        tgt.[RoleId] = src.[RoleId],
        tgt.[DisplayName] = src.[DisplayName],
        tgt.[UpdatedAtUtc] = SYSUTCDATETIME()
WHEN NOT MATCHED BY TARGET THEN INSERT ([ExternalId], [HuddleSegmentId], [RoleId], [DisplayName], [CreatedAtUtc])
    VALUES (src.[ExternalId], src.[HuddleSegmentId], src.[RoleId], src.[DisplayName], SYSUTCDATETIME());
;WITH raw AS (
    SELECT * FROM (VALUES
        (N'SR-ENT-AE', N'SEG-ENT', N'AE', N'Account Executive'),
        (N'SR-ENT-ATS', N'SEG-ENT', N'ATS', N'Account Technology Strategist'),
        (N'SR-ENT-SSP', N'SEG-ENT', N'SSP', N'Solution Sales Professional'),
        (N'SR-ENT-SE', N'SEG-ENT', N'SE', N'Solution Engineer'),
        (N'SR-ENT-CE', N'SEG-ENT', N'CE', N'Commercial Executive'),
        (N'SR-ENT-CSA', N'SEG-ENT', N'CSA', N'Cloud Solution Architect'),
        (N'SR-ENT-CSAM', N'SEG-ENT', N'CSAM', N'Customer Success Account Manager'),
        (N'SR-ENT-ALL', N'SEG-ENT', N'ALL', N'All Roles')
    ) v([ExternalId], [SegmentExternalId], [RoleAbbreviation], [DisplayName])
)
SELECT @unresolved = 8 - COUNT(*) FROM raw
    INNER JOIN dbo.HuddleSegments AS sg ON sg.[ExternalId] = raw.[SegmentExternalId]
    INNER JOIN dbo.Roles AS rl ON rl.[Abbreviation] = raw.[RoleAbbreviation];
IF @unresolved <> 0
    THROW 51000, 'HuddleSegmentRoles: 8 source rows were expected to resolve their foreign keys but some did not. Run the earlier scripts in order and re-check the workbook.', 1;

-- Focus areas
;WITH raw AS (
    SELECT * FROM (VALUES
        (N'FA-01', N'Pipeline and Opportunity'),
        (N'FA-02', N'Customer Engagement and Value'),
        (N'FA-03', N'Solution and Deal Strategy'),
        (N'FA-04', N'Commercial Execution'),
        (N'FA-05', N'Technical Solutioning'),
        (N'FA-06', N'Customer Success and Technical Health'),
        (N'FA-07', N'Orchestration and Investment'),
        (N'FA-00', N'Foundation and Orientation')
    ) v([ExternalId], [Name])
), src AS (
    SELECT raw.*
    FROM raw
)
MERGE dbo.HuddleFocusAreas AS tgt
USING src ON tgt.[ExternalId] = src.[ExternalId]
WHEN MATCHED THEN UPDATE SET
        tgt.[Name] = src.[Name],
        tgt.[UpdatedAtUtc] = SYSUTCDATETIME()
WHEN NOT MATCHED BY TARGET THEN INSERT ([ExternalId], [Name], [CreatedAtUtc])
    VALUES (src.[ExternalId], src.[Name], SYSUTCDATETIME());

-- MCEM stages. StageNumber is stored now rather than parsed out of the ExternalId.
;WITH raw AS (
    SELECT * FROM (VALUES
        (N'MCEM-01', N'Listen and Consult', N'Understand the customer''s business, goals, challenges and priorities.', 1),
        (N'MCEM-02', N'Inspire and Design', N'Show what''s possible, envision solutions, create strategy and design.', 2),
        (N'MCEM-03', N'Empower and Achieve', N'Implement, deploy, enable users, drive adoption and start achieving value.', 3),
        (N'MCEM-04', N'Realize Value', N'Measure results, demonstrate business impact and validate success.', 4),
        (N'MCEM-05', N'Manage and Optimize', N'Continuously improve, optimise usage, expand adoption and identify new opportunities.', 5)
    ) v([ExternalId], [Name], [Description], [StageNumber])
), src AS (
    SELECT raw.*
    FROM raw
)
MERGE dbo.HuddleMcemStages AS tgt
USING src ON tgt.[ExternalId] = src.[ExternalId]
WHEN MATCHED THEN UPDATE SET
        tgt.[Name] = src.[Name],
        tgt.[Description] = src.[Description],
        tgt.[StageNumber] = src.[StageNumber],
        tgt.[UpdatedAtUtc] = SYSUTCDATETIME()
WHEN NOT MATCHED BY TARGET THEN INSERT ([ExternalId], [Name], [Description], [StageNumber], [CreatedAtUtc])
    VALUES (src.[ExternalId], src.[Name], src.[Description], src.[StageNumber], SYSUTCDATETIME());

COMMIT TRANSACTION;
GO
