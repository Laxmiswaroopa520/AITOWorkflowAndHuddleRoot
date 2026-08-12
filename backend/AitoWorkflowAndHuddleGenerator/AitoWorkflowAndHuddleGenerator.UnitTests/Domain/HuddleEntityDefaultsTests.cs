using AitoWorkflowAndHuddleGenerator.Domain.Entities;
using AitoWorkflowAndHuddleGenerator.Domain.Enums;

namespace AitoWorkflowAndHuddleGenerator.UnitTests.Domain;

public sealed class HuddleEntityDefaultsTests
{
    [Fact]
    public void HuddleTopic_ShouldPreserveMissingClientContentAsNull()
    {
        var topic = new HuddleTopic();

        Assert.Equal("WorkingDraft", topic.PublicationStatus);
        Assert.Null(topic.TodayObjective);
        Assert.Null(topic.DesiredOutcome);
        Assert.Null(topic.KeyTakeaway);
        Assert.Empty(topic.Phases);
        Assert.Empty(topic.TopicResources);
    }

    [Fact]
    public void UserOwnedAggregates_ShouldStartWithEmptyConcurrencyTokensAndChildren()
    {
        var plan = new UserHuddlePlan();
        var session = new UserHuddleSession();

        Assert.Empty(plan.RowVersion);
        Assert.Empty(plan.Items);
        Assert.Empty(session.RowVersion);
        Assert.Empty(session.ActivityProgress);
        Assert.Equal(HuddleSessionStatus.InProgress, session.SessionStatus);
    }

    [Theory]
    [InlineData(HuddleVoteValue.Downvote, -1)]
    [InlineData(HuddleVoteValue.Upvote, 1)]
    public void VoteValues_ShouldUseOnlySupportedDatabaseValues(HuddleVoteValue value, int expected)
    {
        Assert.Equal(expected, (int)value);
    }
}
