
USE [AitoWorkflowAndHuddleGeneratorDb];
GO
SET NOCOUNT ON;
SET XACT_ABORT ON;
GO

BEGIN TRY
    BEGIN TRANSACTION;

    DECLARE @ObsoleteExternalIds TABLE (ExternalId nvarchar(100) NOT NULL PRIMARY KEY);
    INSERT @ObsoleteExternalIds (ExternalId)
    VALUES
        (N'required-researcher'),
        (N'required-sales-agent'),
        (N'required-cowork'),
        (N'required-scout'),
        (N'required-agent-j');

    SELECT topic.ExternalId, topic.Id
    INTO #ObsoleteTopics
    FROM dbo.HuddleTopics topic
    INNER JOIN @ObsoleteExternalIds source ON source.ExternalId = topic.ExternalId;

    IF EXISTS
    (
        SELECT 1 FROM dbo.UserHuddlePlanItems item INNER JOIN #ObsoleteTopics topic ON topic.Id = item.HuddleTopicId
        UNION ALL
        SELECT 1 FROM dbo.UserHuddleSessions session INNER JOIN #ObsoleteTopics topic ON topic.Id = session.HuddleTopicId
        UNION ALL
        SELECT 1 FROM dbo.HuddleVotes vote INNER JOIN #ObsoleteTopics topic ON topic.Id = vote.HuddleTopicId
    )
    BEGIN
        SELECT N'UserHuddlePlanItem' AS ReferenceType, topic.ExternalId
        FROM dbo.UserHuddlePlanItems item INNER JOIN #ObsoleteTopics topic ON topic.Id = item.HuddleTopicId
        UNION ALL
        SELECT N'UserHuddleSession', topic.ExternalId
        FROM dbo.UserHuddleSessions session INNER JOIN #ObsoleteTopics topic ON topic.Id = session.HuddleTopicId
        UNION ALL
        SELECT N'HuddleVote', topic.ExternalId
        FROM dbo.HuddleVotes vote INNER JOIN #ObsoleteTopics topic ON topic.Id = vote.HuddleTopicId;

        THROW 51024, 'Obsolete Required Huddles are referenced by user-owned data. No rows were deleted.', 1;
    END;

    DELETE relation FROM dbo.HuddleTopicResources relation INNER JOIN #ObsoleteTopics topic ON topic.Id = relation.HuddleTopicId;
    DELETE relation FROM dbo.HuddleTopicAgents relation INNER JOIN #ObsoleteTopics topic ON topic.Id = relation.HuddleTopicId;
    DELETE relation FROM dbo.HuddleTopicMcemStages relation INNER JOIN #ObsoleteTopics topic ON topic.Id = relation.HuddleTopicId;
    DELETE relation FROM dbo.HuddleTopicRoles relation INNER JOIN #ObsoleteTopics topic ON topic.Id = relation.HuddleTopicId;
    DELETE pathItem FROM dbo.HuddleRolePathItems pathItem INNER JOIN #ObsoleteTopics topic ON topic.Id = pathItem.HuddleTopicId;
    DELETE guide FROM dbo.HuddleFacilitatorGuides guide INNER JOIN #ObsoleteTopics topic ON topic.Id = guide.HuddleTopicId;
    DELETE relation FROM dbo.HuddleActivityResources relation INNER JOIN dbo.HuddleActivities activity ON activity.Id = relation.HuddleActivityId INNER JOIN #ObsoleteTopics topic ON topic.Id = activity.HuddleTopicId;
    DELETE relation FROM dbo.HuddleActivityAgents relation INNER JOIN dbo.HuddleActivities activity ON activity.Id = relation.HuddleActivityId INNER JOIN #ObsoleteTopics topic ON topic.Id = activity.HuddleTopicId;
    DELETE activity FROM dbo.HuddleActivities activity INNER JOIN #ObsoleteTopics topic ON topic.Id = activity.HuddleTopicId;
    DELETE phase FROM dbo.HuddlePhases phase INNER JOIN #ObsoleteTopics topic ON topic.Id = phase.HuddleTopicId;

    DELETE topic
    FROM dbo.HuddleTopics topic
    INNER JOIN #ObsoleteTopics obsolete ON obsolete.Id = topic.Id;

    SELECT source.ExternalId,
           CASE WHEN topic.Id IS NULL THEN N'Removed or already absent' ELSE N'Still present' END AS Result
    FROM @ObsoleteExternalIds source
    LEFT JOIN dbo.HuddleTopics topic ON topic.ExternalId = source.ExternalId
    ORDER BY source.ExternalId;

    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
    THROW;
END CATCH;
GO
