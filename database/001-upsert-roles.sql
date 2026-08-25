/*
001 - Upsert Roles
Generated from the uploaded SharePoint CSV exports.
Safe to rerun. Uses ExternalId/name lookups instead of hardcoded identity IDs.
*/
USE [AitoWorkflowAndHuddleGeneratorDb];
GO
SET NOCOUNT ON;
SET XACT_ABORT ON;
GO
BEGIN TRY
    BEGIN TRANSACTION;

    DECLARE @Source TABLE
    (
        ExternalId nvarchar(50) NOT NULL,
        Name nvarchar(150) NOT NULL,
        Abbreviation nvarchar(30) NOT NULL,
        Segment nvarchar(50) NULL,
        Description nvarchar(1000) NULL,
        SortOrder int NOT NULL,
        IsActive bit NOT NULL
    );

    INSERT INTO @Source VALUES
(N'ae-ent',N'Account Executive',N'AE',N'Enterprise',N'Manages strategic enterprise accounts with complex multi-stakeholder deals and long sales cycles.',1,CAST(1 AS bit)),
(N'ce-ent',N'Commercial Executive',N'CE',N'Enterprise',N'Structures pricing, licensing, and commercial terms for deals and coordinates across team.',2,CAST(1 AS bit)),
(N'ats-ent',N'Account Technology Strategist',N'ATS',N'Enterprise',N'Owns the technical strategy and solution roadmap for enterprise accounts.',3,CAST(1 AS bit)),
(N'ssp-ent',N'Solution Area Specialist',N'SSP',N'Enterprise',N'Drives solution-specific opportunities by shaping vision and leading value-based conversations.',4,CAST(1 AS bit)),
(N'se-ent',N'Solution Engineer',N'SE',N'Enterprise',N'Leads technical discovery, qualification, and execution of demos, PoCs, and solution designs.',5,CAST(1 AS bit)),
(N'csa-ces',N'Cloud Solution Architect',N'CSA',N'CE&S',N'Designs and validates cloud and AI architectures for customer success.',6,CAST(1 AS bit)),
(N'csam-ces',N'Customer Success Account Manager',N'CSAM',N'CE&S',N'Drives customer adoption, expansion, and renewal through success planning.',7,CAST(1 AS bit)),
(N'sm-mgr',N'Sales Manager',N'SM',N'Manager',N'Coaches sellers using AI-driven insights to improve deal quality and effectiveness.',8,CAST(1 AS bit));

    UPDATE target
    SET target.Name=src.Name,
        target.Abbreviation=src.Abbreviation,
        target.Segment=src.Segment,
        target.Description=src.Description,
        target.SortOrder=src.SortOrder,
        target.IsActive=src.IsActive,
        target.UpdatedAtUtc=SYSUTCDATETIME()
    FROM dbo.Roles target
    INNER JOIN @Source src ON src.ExternalId=target.ExternalId;

    INSERT dbo.Roles
    (ExternalId,Name,Abbreviation,Segment,Description,SortOrder,IsActive,CreatedAtUtc,UpdatedAtUtc)
    SELECT src.ExternalId,src.Name,src.Abbreviation,src.Segment,src.Description,
           src.SortOrder,src.IsActive,SYSUTCDATETIME(),NULL
    FROM @Source src
    WHERE NOT EXISTS (SELECT 1 FROM dbo.Roles target WHERE target.ExternalId=src.ExternalId);
    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
    THROW;
END CATCH;
GO
