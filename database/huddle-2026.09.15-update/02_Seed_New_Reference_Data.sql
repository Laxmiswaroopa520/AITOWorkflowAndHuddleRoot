
SET NOCOUNT ON;
SET XACT_ABORT ON;
DECLARE @unresolved INT;
BEGIN TRANSACTION;

-- New Roles (only ROLE-SMEC-CE is genuinely new; SortOrder appended after the existing 13)
;WITH raw AS (
    SELECT * FROM (VALUES
        (N'ROLE-SMEC-CE', N'Commercial Executive (SME&C)', N'SMEC-CE', N'SME&C', 14, 1)
    ) v([ExternalId], [Name], [Abbreviation], [Segment], [SortOrder], [IsActive])
), src AS (
    SELECT raw.*
    FROM raw
)
MERGE dbo.Roles AS tgt
USING src ON tgt.[ExternalId] = src.[ExternalId]
WHEN MATCHED THEN UPDATE SET
        tgt.[Name] = src.[Name],
        tgt.[Abbreviation] = src.[Abbreviation],
        tgt.[Segment] = src.[Segment],
        tgt.[SortOrder] = src.[SortOrder],
        tgt.[IsActive] = src.[IsActive],
        tgt.[UpdatedAtUtc] = SYSUTCDATETIME()
WHEN NOT MATCHED BY TARGET THEN INSERT ([ExternalId], [Name], [Abbreviation], [Segment], [SortOrder], [IsActive], [CreatedAtUtc])
    VALUES (src.[ExternalId], src.[Name], src.[Abbreviation], src.[Segment], src.[SortOrder], src.[IsActive], SYSUTCDATETIME());

COMMIT TRANSACTION;
GO
