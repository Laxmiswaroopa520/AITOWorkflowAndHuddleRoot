using AitoWorkflowAndHuddleGenerator.Application.Abstractions.Identity;
using AitoWorkflowAndHuddleGenerator.Application.Features.Huddles.Votes.Commands.RemoveHuddleVote;
using AitoWorkflowAndHuddleGenerator.Application.Features.Huddles.Votes.Commands.SetHuddleVote;
using AitoWorkflowAndHuddleGenerator.Application.Features.Huddles.Votes.Queries.GetHuddleVotes;
using AitoWorkflowAndHuddleGenerator.Domain.Entities;
using AitoWorkflowAndHuddleGenerator.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace AitoWorkflowAndHuddleGenerator.IntegrationTests.Huddles;

public sealed class HuddleVoteApiTests
{
    [Fact]
    public async Task SetVote_ShouldPersistOneVotePerUserAndReturnAggregateCounts()
    {
        await using ApplicationDbContext db = CreateContext();
        db.HuddleTopics.Add(new HuddleTopic
        {
            ExternalId = "topic-1",
            Name = "Topic",
            Type = "Prescriptive",
            PublicationStatus = "Published"
        });
        await db.SaveChangesAsync();
        var currentUser = new TestCurrentUserService("user-1");
        var handler = new SetHuddleVoteCommandHandler(db, currentUser);

        var upvote = await handler.Handle(
            new SetHuddleVoteCommand("topic-1", 1, null, null), default);
        var downvote = await handler.Handle(
            new SetHuddleVoteCommand("topic-1", -1, ["Not relevant to my role"], "Needs review"), default);

        Assert.Equal(1, await db.HuddleVotes.CountAsync());
        Assert.Equal(1, upvote.Upvotes);
        Assert.Equal(-1, downvote.CurrentUserVote);
        Assert.Equal(0, downvote.Upvotes);
        Assert.Equal(1, downvote.Downvotes);
        Assert.NotNull((await db.HuddleVotes.SingleAsync()).DownvoteReasons);
    }

    [Fact]
    public async Task GetAndRemoveVotes_ShouldUseAuthenticatedUserState()
    {
        await using ApplicationDbContext db = CreateContext();
        HuddleTopic topic = new()
        {
            ExternalId = "topic-1",
            Name = "Topic",
            Type = "Prescriptive",
            PublicationStatus = "Published"
        };
        db.HuddleTopics.Add(topic);
        await db.SaveChangesAsync();
        var currentUser = new TestCurrentUserService("user-1");
        await new SetHuddleVoteCommandHandler(db, currentUser).Handle(
            new SetHuddleVoteCommand("topic-1", 1, null, null), default);

        var response = await new GetHuddleVotesQueryHandler(db, currentUser)
            .Handle(new GetHuddleVotesQuery(), default);
        await new RemoveHuddleVoteCommandHandler(db, currentUser)
            .Handle(new RemoveHuddleVoteCommand("topic-1"), default);

        Assert.Equal(1, Assert.Single(response).CurrentUserVote);
        Assert.Empty(db.HuddleVotes);
    }

    private static ApplicationDbContext CreateContext()
    {
        DbContextOptions<ApplicationDbContext> options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString()).Options;
        return new ApplicationDbContext(options);
    }

    private sealed class TestCurrentUserService(string objectId) : ICurrentUserService
    {
        public bool IsAuthenticated => true;
        public string? ObjectId => objectId;
        public string? Email => "test@example.com";
        public string? DisplayName => "Test User";
        public IReadOnlyCollection<string> Roles => [];
    }
}
