USE [AitoWorkflowAndHuddleGeneratorDb];
GO

SET NOCOUNT ON;
SET XACT_ABORT ON;
GO

/*
    Purpose
    -------
    Publishes the complete current ZIP/mock Huddle catalog so it is available
    through the participant APIs and visible in the Huddle UI.

    This script intentionally changes only PublicationStatus and UpdatedAtUtc.
    Missing semantic fields remain NULL and no substitute content is introduced.

    Safe to rerun: rows already marked Published are not updated again.
*/

BEGIN TRY
    BEGIN TRANSACTION;

    DECLARE @SourceCount int;
    DECLARE @AlreadyPublishedCount int;
    DECLARE @PublishedNowCount int;

    SELECT @SourceCount = COUNT(*)
    FROM dbo.HuddleTopics;

    IF @SourceCount = 0
    BEGIN
        THROW 51023,
            'No Huddle topics were found. Run the Huddle catalog seed scripts before publishing.',
            1;
    END;

    SELECT @AlreadyPublishedCount = COUNT(*)
    FROM dbo.HuddleTopics
    WHERE PublicationStatus = N'Published';

    UPDATE dbo.HuddleTopics
    SET PublicationStatus = N'Published',
        UpdatedAtUtc = SYSUTCDATETIME()
    WHERE PublicationStatus <> N'Published'
       OR PublicationStatus IS NULL;

    SET @PublishedNowCount = @@ROWCOUNT;

    IF EXISTS
    (
        SELECT 1
        FROM dbo.HuddleTopics
        WHERE PublicationStatus <> N'Published'
           OR PublicationStatus IS NULL
    )
    BEGIN
        THROW 51024,
            'One or more Huddle topics could not be published. The transaction was rolled back.',
            1;
    END;

    COMMIT TRANSACTION;

    SELECT
        @SourceCount AS TotalTopicCount,
        @AlreadyPublishedCount AS AlreadyPublishedCount,
        @PublishedNowCount AS PublishedNowCount,
        (SELECT COUNT(*) FROM dbo.HuddleTopics WHERE PublicationStatus = N'Published')
            AS FinalPublishedCount;

    SELECT
        Type,
        PublicationStatus,
        COUNT(*) AS TopicCount
    FROM dbo.HuddleTopics
    GROUP BY Type, PublicationStatus
    ORDER BY Type, PublicationStatus;

    SELECT
        ExternalId,
        Name,
        Type,
        PublicationStatus,
        DurationMinutes,
        CASE
            WHEN TodayObjective IS NULL THEN N'Unavailable'
            ELSE N'Available'
        END AS TodayObjectiveStatus,
        CASE
            WHEN DesiredOutcome IS NULL THEN N'Unavailable'
            ELSE N'Available'
        END AS DesiredOutcomeStatus
    FROM dbo.HuddleTopics
    ORDER BY Type, Name;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
        ROLLBACK TRANSACTION;

    THROW;
END CATCH;
GO
