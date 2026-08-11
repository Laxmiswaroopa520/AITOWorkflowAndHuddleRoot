USE [AitoWorkflowAndHuddleGeneratorDb];
GO
SET NOCOUNT ON;
SET XACT_ABORT ON;
GO

BEGIN TRY
    BEGIN TRANSACTION;

    DECLARE @Source TABLE
    (
        ExternalId nvarchar(100) NOT NULL PRIMARY KEY,
        DurationMinutes int NOT NULL,
        AudienceDescription nvarchar(max) NULL
    );

    INSERT @Source (ExternalId, DurationMinutes, AudienceDescription)
    VALUES
        (N'required-researcher', 30, N'Those who need to gain efficiency in compiling data, refining topics, and building a foundation for informed decisions.'),
        (N'required-sales-agent', 30, N'For anyone who needs to execute end to end workflows aligned to seller jobs to be done, grounded in Sales data, across multiple systems of record.'),
        (N'required-cowork', 30, N'For anyone whose work is primarily in M365: email, Teams, documents, wanting fast, high-quality assistance with minimal setup.'),
        (N'required-scout', 30, N'For anyone whose work spans systems beyond M365: local files, browser, shell, MCPs or custom integrations, not just single tasks.'),
        (N'required-agent-j', 30, N'For anyone preparing for, practicing, or reflecting on customer, partner, stakeholder, and internal conversations.');

    IF EXISTS
    (
        SELECT 1
        FROM @Source source
        WHERE NOT EXISTS
        (
            SELECT 1
            FROM dbo.HuddleTopics topic
            WHERE topic.ExternalId = source.ExternalId
              AND topic.Type = N'Foundation'
        )
    )
    BEGIN
        SELECT source.ExternalId AS MissingFoundationExternalId
        FROM @Source source
        WHERE NOT EXISTS
        (
            SELECT 1
            FROM dbo.HuddleTopics topic
            WHERE topic.ExternalId = source.ExternalId
              AND topic.Type = N'Foundation'
        );

        THROW 51022, 'One or more Foundation Huddle topics are missing. No rows were updated.', 1;
    END;

    UPDATE topic
    SET topic.DurationMinutes = source.DurationMinutes,
        topic.AudienceDescription = source.AudienceDescription,
        topic.UpdatedAtUtc = SYSUTCDATETIME()
    FROM dbo.HuddleTopics topic
    INNER JOIN @Source source ON source.ExternalId = topic.ExternalId
    WHERE topic.Type = N'Foundation'
      AND
      (
          topic.DurationMinutes <> source.DurationMinutes
          OR topic.DurationMinutes IS NULL
          OR ISNULL(topic.AudienceDescription, N'') <> ISNULL(source.AudienceDescription, N'')
      );

    SELECT
        topic.ExternalId,
        topic.PublicationStatus,
        topic.DurationMinutes,
        topic.AudienceDescription
    FROM dbo.HuddleTopics topic
    INNER JOIN @Source source ON source.ExternalId = topic.ExternalId
    ORDER BY topic.ExternalId;

    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
    THROW;
END CATCH;
GO
