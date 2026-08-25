
USE [AitoWorkflowAndHuddleGeneratorDb];
GO
SET NOCOUNT ON;
SET XACT_ABORT ON;
GO

BEGIN TRY
    BEGIN TRANSACTION;

    IF OBJECT_ID(N'dbo.HuddleTopics', N'U') IS NULL
       OR OBJECT_ID(N'dbo.HuddlePhases', N'U') IS NULL
       OR OBJECT_ID(N'dbo.HuddleActivities', N'U') IS NULL
    BEGIN
        THROW 51020, 'Required Huddle catalog tables are missing.', 1;
    END;

    /* Every topic containing activities must have exactly one governed target phase. */
    IF EXISTS
    (
        SELECT activity.HuddleTopicId
        FROM dbo.HuddleActivities activity
        GROUP BY activity.HuddleTopicId
        HAVING
        (
            SELECT COUNT(*)
            FROM dbo.HuddlePhases phase
            WHERE phase.HuddleTopicId = activity.HuddleTopicId
              AND phase.Name = N'Explore and Practice'
        ) <> 1
    )
    BEGIN
        THROW 51021, 'A topic containing activities does not have exactly one Explore and Practice phase.', 1;
    END;

    DECLARE @Moves TABLE
    (
        ActivityId int NOT NULL PRIMARY KEY,
        TargetPhaseId int NOT NULL,
        NewDisplayOrder int NOT NULL
    );

    INSERT @Moves (ActivityId, TargetPhaseId, NewDisplayOrder)
    SELECT
        activity.Id,
        targetPhase.Id,
        ROW_NUMBER() OVER
        (
            PARTITION BY activity.HuddleTopicId
            ORDER BY
                currentPhase.DisplayOrder,
                activity.DisplayOrder,
                activity.ExternalId
        )
    FROM dbo.HuddleActivities activity
    INNER JOIN dbo.HuddlePhases currentPhase
        ON currentPhase.Id = activity.HuddlePhaseId
    INNER JOIN dbo.HuddlePhases targetPhase
        ON targetPhase.HuddleTopicId = activity.HuddleTopicId
       AND targetPhase.Name = N'Explore and Practice';

    DECLARE @SourceCount int = (SELECT COUNT(*) FROM @Moves);
    DECLARE @AlreadyCorrectCount int =
    (
        SELECT COUNT(*)
        FROM @Moves move
        INNER JOIN dbo.HuddleActivities activity ON activity.Id = move.ActivityId
        WHERE activity.HuddlePhaseId = move.TargetPhaseId
          AND activity.DisplayOrder = move.NewDisplayOrder
    );

    /* Temporarily free the unique phase/display-order positions. */
    UPDATE activity
    SET activity.DisplayOrder = -activity.Id
    FROM dbo.HuddleActivities activity
    INNER JOIN @Moves move ON move.ActivityId = activity.Id
    WHERE activity.HuddlePhaseId <> move.TargetPhaseId
       OR activity.DisplayOrder <> move.NewDisplayOrder;

    UPDATE activity
    SET
        activity.HuddlePhaseId = move.TargetPhaseId,
        activity.DisplayOrder = move.NewDisplayOrder,
        activity.UpdatedAtUtc = SYSUTCDATETIME()
    FROM dbo.HuddleActivities activity
    INNER JOIN @Moves move ON move.ActivityId = activity.Id
    WHERE activity.HuddlePhaseId <> move.TargetPhaseId
       OR activity.DisplayOrder <> move.NewDisplayOrder;

    DECLARE @MovedCount int = @@ROWCOUNT;

    IF EXISTS
    (
        SELECT 1
        FROM dbo.HuddleActivities activity
        INNER JOIN dbo.HuddlePhases phase ON phase.Id = activity.HuddlePhaseId
        WHERE phase.Name <> N'Explore and Practice'
    )
    BEGIN
        THROW 51022, 'Validation failed: at least one activity remains outside Explore and Practice.', 1;
    END;

    SELECT
        @SourceCount AS ActivityCount,
        @MovedCount AS MovedCount,
        @AlreadyCorrectCount AS AlreadyCorrectCount;

    SELECT
        topic.ExternalId AS TopicExternalId,
        phase.Name AS PhaseName,
        COUNT(activity.Id) AS ActivityCount
    FROM dbo.HuddleTopics topic
    INNER JOIN dbo.HuddlePhases phase ON phase.HuddleTopicId = topic.Id
    LEFT JOIN dbo.HuddleActivities activity ON activity.HuddlePhaseId = phase.Id
    GROUP BY topic.ExternalId, phase.DisplayOrder, phase.Name
    ORDER BY topic.ExternalId, phase.DisplayOrder;

    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
    THROW;
END CATCH;
GO
