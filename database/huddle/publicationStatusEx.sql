USE AitoWorkflowAndHuddleGeneratorDb;
GO

BEGIN TRY
    BEGIN TRANSACTION;

    UPDATE dbo.HuddleTopics
    SET PublicationStatus = N'Published',
        UpdatedAtUtc = SYSUTCDATETIME()
    WHERE PublicationStatus = N'WorkingDraft';

    SELECT
        PublicationStatus,
        Type,
        COUNT(*) AS TopicCount
    FROM dbo.HuddleTopics
    GROUP BY PublicationStatus, Type
    ORDER BY PublicationStatus, Type;

    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
        ROLLBACK TRANSACTION;

    THROW;
END CATCH;
GO