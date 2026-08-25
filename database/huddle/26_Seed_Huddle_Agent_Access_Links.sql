/*
    IMPORTANT:
    Review the selected database before executing this script.
    This script is generated for manual execution in SSMS.
    It has not been executed automatically.

    PURPOSE
    -------
    07_Seed_Huddle_Agents.sql inserts every HuddleAgents row with AccessUrl = NULL and
    AccessLinkLabel = NULL. HuddleTopicAgents.ShowAgentAccessLink and
    HuddleActivityAgents.ShowAgentAccessLink are already CAST(1 AS bit) from scripts 16 and 17,
    so the API returns showAccessLink = true with accessUrl = null. The frontend therefore has
    no destination for the "Open in <agent>" action.

    This script resolves each agent's access link from the existing dbo.HuddleResources catalog
    seeded by 08_Seed_Huddle_Resources.sql. No URL literal is introduced here: the URL is read
    from HuddleResources.Url, so the resource catalog stays the single source of truth.

    It also creates the corresponding dbo.HuddleAgentResources rows, which
    20_Seed_Huddle_Agent_Resources.sql intentionally left empty.

    Agents with no matching resource in the catalog (TOOL-001, TOOL-008, TOOL-009, TOOL-010,
    TOOL-011) are deliberately left NULL. No values are invented.

    The script is idempotent and transactional and can be re-run safely.
*/
USE [AitoWorkflowAndHuddleGeneratorDb];
GO
SET NOCOUNT ON;
SET XACT_ABORT ON;
GO
BEGIN TRY
    BEGIN TRANSACTION;

    DECLARE @MissingAgentCount int = 0,
            @MissingResourceCount int = 0,
            @AgentsUpdated int = 0,
            @AgentResourcesInserted int = 0,
            @AgentResourcesUpdated int = 0;

    -- Agent -> resource mapping. AccessLinkLabel is the call to action shown on the button.
    DECLARE @Source TABLE
    (
        AgentExternalId    nvarchar(100) NOT NULL PRIMARY KEY,
        ResourceExternalId nvarchar(100) NOT NULL,
        AccessLinkLabel    nvarchar(200) NOT NULL
    );

    INSERT @Source (AgentExternalId, ResourceExternalId, AccessLinkLabel)
    VALUES
        (N'TOOL-002', N'RES-002', N'Open Sales Agent'),
        (N'TOOL-003', N'RES-003', N'Open Cowork'),
        (N'TOOL-004', N'RES-004', N'Open Scout'),
        (N'TOOL-005', N'RES-007', N'Open Researcher'),
        (N'TOOL-006', N'RES-008', N'Open Analyst'),
        (N'TOOL-007', N'RES-006', N'Open MSXI Copilot');

    -- Supporting resources shown alongside each agent, in addition to the access link above.
    DECLARE @SupportingSource TABLE
    (
        AgentExternalId    nvarchar(100) NOT NULL,
        ResourceExternalId nvarchar(100) NOT NULL,
        DisplayOrder       int           NOT NULL,
        PRIMARY KEY (AgentExternalId, ResourceExternalId)
    );

    INSERT @SupportingSource (AgentExternalId, ResourceExternalId, DisplayOrder)
    VALUES
        (N'TOOL-002', N'RES-002', 1),
        (N'TOOL-002', N'RES-001', 2),
        (N'TOOL-003', N'RES-003', 1),
        (N'TOOL-004', N'RES-004', 1),
        (N'TOOL-005', N'RES-007', 1),
        (N'TOOL-006', N'RES-008', 1),
        (N'TOOL-007', N'RES-006', 1);

    -- Fail loudly rather than silently skipping unknown external IDs.
    SELECT @MissingAgentCount = COUNT(*)
    FROM
    (
        SELECT AgentExternalId FROM @Source
        UNION
        SELECT AgentExternalId FROM @SupportingSource
    ) required
    WHERE NOT EXISTS (SELECT 1 FROM dbo.HuddleAgents agent WHERE agent.ExternalId = required.AgentExternalId);

    SELECT @MissingResourceCount = COUNT(*)
    FROM
    (
        SELECT ResourceExternalId FROM @Source
        UNION
        SELECT ResourceExternalId FROM @SupportingSource
    ) required
    WHERE NOT EXISTS (SELECT 1 FROM dbo.HuddleResources resource WHERE resource.ExternalId = required.ResourceExternalId);

    IF @MissingAgentCount > 0 OR @MissingResourceCount > 0
    BEGIN
        SELECT required.AgentExternalId AS MissingAgentExternalId
        FROM (SELECT AgentExternalId FROM @Source UNION SELECT AgentExternalId FROM @SupportingSource) required
        WHERE NOT EXISTS (SELECT 1 FROM dbo.HuddleAgents agent WHERE agent.ExternalId = required.AgentExternalId);

        SELECT required.ResourceExternalId AS MissingResourceExternalId
        FROM (SELECT ResourceExternalId FROM @Source UNION SELECT ResourceExternalId FROM @SupportingSource) required
        WHERE NOT EXISTS (SELECT 1 FROM dbo.HuddleResources resource WHERE resource.ExternalId = required.ResourceExternalId);

        THROW 51026, 'One or more agents or resources are missing. Run 07 and 08 first. No rows were changed.', 1;
    END;

    -- 1. Set AccessUrl / AccessLinkLabel from the resource catalog.
    UPDATE agent
    SET agent.AccessUrl = resource.Url,
        agent.AccessLinkLabel = source.AccessLinkLabel,
        agent.UpdatedAtUtc = SYSUTCDATETIME()
    FROM dbo.HuddleAgents agent
    INNER JOIN @Source source ON source.AgentExternalId = agent.ExternalId
    INNER JOIN dbo.HuddleResources resource ON resource.ExternalId = source.ResourceExternalId
    WHERE resource.Url IS NOT NULL
      AND
      (
          ISNULL(agent.AccessUrl, N'') <> ISNULL(resource.Url, N'')
          OR ISNULL(agent.AccessLinkLabel, N'') <> source.AccessLinkLabel
      );

    SET @AgentsUpdated = @@ROWCOUNT;

    -- 2. Keep existing HuddleAgentResources display order in sync.
    UPDATE link
    SET link.DisplayOrder = source.DisplayOrder
    FROM dbo.HuddleAgentResources link
    INNER JOIN dbo.HuddleAgents agent ON agent.Id = link.HuddleAgentId
    INNER JOIN dbo.HuddleResources resource ON resource.Id = link.HuddleResourceId
    INNER JOIN @SupportingSource source
        ON source.AgentExternalId = agent.ExternalId
       AND source.ResourceExternalId = resource.ExternalId
    WHERE link.DisplayOrder <> source.DisplayOrder;

    SET @AgentResourcesUpdated = @@ROWCOUNT;

    -- 3. Insert the missing HuddleAgentResources rows.
    INSERT dbo.HuddleAgentResources (HuddleAgentId, HuddleResourceId, DisplayOrder)
    SELECT agent.Id, resource.Id, source.DisplayOrder
    FROM @SupportingSource source
    INNER JOIN dbo.HuddleAgents agent ON agent.ExternalId = source.AgentExternalId
    INNER JOIN dbo.HuddleResources resource ON resource.ExternalId = source.ResourceExternalId
    WHERE NOT EXISTS
    (
        SELECT 1
        FROM dbo.HuddleAgentResources existing
        WHERE existing.HuddleAgentId = agent.Id
          AND existing.HuddleResourceId = resource.Id
    );

    SET @AgentResourcesInserted = @@ROWCOUNT;

    SELECT @AgentsUpdated          AS AgentsUpdated,
           @AgentResourcesInserted AS AgentResourcesInserted,
           @AgentResourcesUpdated  AS AgentResourcesUpdated;

    -- Verification: every agent link the UI can render, and whether it now has a destination.
    SELECT agent.ExternalId,
           agent.Name,
           agent.AccessLinkLabel,
           agent.AccessUrl,
           CASE WHEN agent.AccessUrl IS NULL THEN N'No access link' ELSE N'Ready' END AS AccessState,
           (SELECT COUNT(*) FROM dbo.HuddleAgentResources link WHERE link.HuddleAgentId = agent.Id) AS ResourceCount
    FROM dbo.HuddleAgents agent
    ORDER BY agent.ExternalId;

    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
    THROW;
END CATCH;
GO
