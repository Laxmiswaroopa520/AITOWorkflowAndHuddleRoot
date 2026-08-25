/*
003 - Upsert Workflow Buckets
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
        ExternalId nvarchar(100) NOT NULL,
        Name nvarchar(200) NOT NULL,
        Description nvarchar(1000) NULL,
        SortOrder int NOT NULL,
        IsActive bit NOT NULL
    );

    INSERT INTO @Source VALUES
(N'planning-prioritization',N'Planning & Prioritization',N'Strategic account and territory planning activities',1,CAST(1 AS bit)),
(N'pipeline-forecasting',N'Pipeline & Forecasting',N'Pipeline management, forecasting, and deal tracking',2,CAST(1 AS bit)),
(N'deal-execution-commercial',N'Deal Execution & Commercial',N'Active deal management and commercial negotiations',3,CAST(1 AS bit)),
(N'customer-engagement-executive-alignment',N'Customer Engagement & Executive Alignment',N'Customer meetings, exec alignment, relationship building',4,CAST(1 AS bit)),
(N'technical-validation-solution-delivery-prep',N'Technical Validation & Solution Delivery Prep',N'Technical demos, POCs, architecture reviews',5,CAST(1 AS bit)),
(N'adoption-consumption-value-realization',N'Adoption, Consumption & Value Realization',N'Driving adoption, consumption, and business value',6,CAST(1 AS bit)),
(N'partner-ecosystem',N'Partner & Ecosystem',N'Partner engagement and ecosystem coordination',7,CAST(1 AS bit)),
(N'operations-governance-risk',N'Operations, Governance & Risk',N'Internal operations, compliance, and risk management',8,CAST(1 AS bit)),
(N'enablement-skill-development',N'Enablement & Skill Development',N'Training, certifications, and skill building',9,CAST(1 AS bit));

    UPDATE target
    SET target.Name=src.Name,
        target.Description=src.Description,
        target.SortOrder=src.SortOrder,
        target.IsActive=src.IsActive,
        target.UpdatedAtUtc=SYSUTCDATETIME()
    FROM dbo.WorkflowBuckets target
    INNER JOIN @Source src ON src.ExternalId=target.ExternalId;

    INSERT dbo.WorkflowBuckets
    (ExternalId,Name,Description,SortOrder,IsActive,CreatedAtUtc,UpdatedAtUtc)
    SELECT src.ExternalId,src.Name,src.Description,src.SortOrder,src.IsActive,
           SYSUTCDATETIME(),NULL
    FROM @Source src
    WHERE NOT EXISTS (SELECT 1 FROM dbo.WorkflowBuckets target WHERE target.ExternalId=src.ExternalId);
    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
    THROW;
END CATCH;
GO
