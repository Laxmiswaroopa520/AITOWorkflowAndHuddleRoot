/*
002 - Upsert AI Tools
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
        Name nvarchar(150) NOT NULL,
        Description nvarchar(1000) NULL,
        Color nvarchar(100) NULL,
        IconKey nvarchar(100) NULL,
        SortOrder int NOT NULL,
        IsActive bit NOT NULL
    );

    INSERT INTO @Source VALUES
(N'sales-agent',N'Sales Agent',N'Go-to sales workflows across MSX, email, meetings, and content to analyze, act, and move deals.',N'#107C10',N'sales-agent',1,CAST(1 AS bit)),
(N'msxi-copilot',N'MSXI Copilot',N'Native Copilot in MSX/MSXI for CRM workflows, forecasting, and pipeline Q&A.',N'#8764B8',N'msxi-copilot',2,CAST(1 AS bit)),
(N'm365-copilot',N'M365 Copilot',N'Everyday productivity across Outlook, Teams, Office and enterprise content.',N'#0078D4',N'm365-copilot',3,CAST(1 AS bit)),
(N'ecif-agent',N'ECIF Agent',N'ECIF eligibility, submissions, and status support (via Sales Agent).',N'#F7630C',N'ecif-agent',4,CAST(1 AS bit)),
(N'research-canvas',N'Research Canvas in MSXI',N'AI research workspace in MSXI for competitive and account intelligence.',N'#00B7C3',N'research-canvas',5,CAST(1 AS bit)),
(N'sales-agent-auto-fix-pipeline-agent',N'Auto-Fix Pipeline Agent',N'Pipeline hygiene and risk management-detects issues, recommends fixes, and helps keep opportunities on track.',N'#2E8B57',N'sales-agent-auto-fix-pipeline-agent',6,CAST(1 AS bit)),
(N'deal-making-capabilities-in-sales-agent',N'Deal Making Capabilities in Sales Agent',N'Deal execution and progression support - status, risks, and next steps (via Sales Agent).',N'#E74856',N'deal-making-capabilities-in-sales-agent',7,CAST(1 AS bit)),
(N'intelligent-snapshots-msxi',N'Intelligent Snapshots in MSXI',N'Fabric-powered trend analysis replacing manual snapshotting.',N'#FFC83D',N'intelligent-snapshots-msxi',8,CAST(1 AS bit)),
(N'proactive-insights-in-msxi',N'Proactive Insights in MSXI',N'Signal-based insights surfaced inside MSXI.',N'#8A2BE2',N'proactive-insights-in-msxi',9,CAST(1 AS bit)),
(N'cowork',N'Cowork',N'Builder & automation workspace - create, organize, and scale AI-driven workflows and assets.',N'#6264A7',N'cowork',10,CAST(1 AS bit)),
(N'scout',N'Scout',N'Agent for renewal/forecast setup and hygiene tasks (Manager use cases).',N'#C239B3',N'scout',11,CAST(1 AS bit)),
(N'researcher',N'Researcher',N'Deep customer discovery and research, pulling insights from multiple sources.',N'#00A2A0',N'researcher',12,CAST(1 AS bit)),
(N'analyst',N'Analyst',N'Turns data into clear insights, trends, and recommendations.',N'#B4009E',N'analyst',13,CAST(1 AS bit)),
(N'viva-learning-ms-learn',N'Viva Learning / MS Learn',N'Skilling and learning content referenced for enablement activities.',N'#5C2D91',N'viva-learning-ms-learn',14,CAST(1 AS bit));

    UPDATE target
    SET target.Name=src.Name,
        target.Description=src.Description,
        target.Color=src.Color,
        target.IconKey=src.IconKey,
        target.SortOrder=src.SortOrder,
        target.IsActive=src.IsActive,
        target.UpdatedAtUtc=SYSUTCDATETIME()
    FROM dbo.AiTools target
    INNER JOIN @Source src ON src.ExternalId=target.ExternalId;

    INSERT dbo.AiTools
    (ExternalId,Name,Description,Color,IconKey,SortOrder,IsActive,CreatedAtUtc,UpdatedAtUtc)
    SELECT src.ExternalId,src.Name,src.Description,src.Color,src.IconKey,
           src.SortOrder,src.IsActive,SYSUTCDATETIME(),NULL
    FROM @Source src
    WHERE NOT EXISTS (SELECT 1 FROM dbo.AiTools target WHERE target.ExternalId=src.ExternalId);
    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
    THROW;
END CATCH;
GO
