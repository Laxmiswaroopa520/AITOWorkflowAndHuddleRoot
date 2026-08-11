using AitoWorkflowAndHuddleGenerator.Application.Abstractions.Identity;
using AitoWorkflowAndHuddleGenerator.Application.Features.Huddles.Plans.Commands.ResetHuddlePlan;
using AitoWorkflowAndHuddleGenerator.Application.Features.Huddles.Plans.Commands.SaveHuddlePlan;
using AitoWorkflowAndHuddleGenerator.Application.Features.Huddles.Plans.Queries.GetMyHuddlePlan;
using AitoWorkflowAndHuddleGenerator.Contracts.Huddles;
using AitoWorkflowAndHuddleGenerator.Domain.Entities;
using AitoWorkflowAndHuddleGenerator.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace AitoWorkflowAndHuddleGenerator.IntegrationTests.Huddles;

public sealed class HuddlePlanApiTests
{
    [Fact]
    public async Task Plan_ShouldSaveForAuthenticatedOwnerAndResetToRecommended()
    {
        await using ApplicationDbContext db = CreateContext();
        await SeedCatalog(db);
        var user = new TestCurrentUserService("user-1");
        var query = new GetMyHuddlePlanQueryHandler(db, user);
        HuddlePlanResponse initial = await query.Handle(new GetMyHuddlePlanQuery("role-1"), default);

        SaveHuddlePlanItemRequest[] reversed = initial.Items.Reverse()
            .Select((item, index) => new SaveHuddlePlanItemRequest(6 + index, item.Huddle.ExternalId)).ToArray();
        HuddlePlanResponse saved = await new SaveHuddlePlanCommandHandler(db, user)
            .Handle(new SaveHuddlePlanCommand("role-1", null, reversed), default);

        Assert.True(saved.IsCustomized);
        Assert.Equal("user-1", (await db.UserHuddlePlans.SingleAsync()).OwnerObjectId);
        Assert.Equal(7, await db.UserHuddlePlanItems.CountAsync());

        await new ResetHuddlePlanCommandHandler(db, user)
            .Handle(new ResetHuddlePlanCommand("role-1"), default);
        HuddlePlanResponse reset = await query.Handle(new GetMyHuddlePlanQuery("role-1"), default);
        Assert.False(reset.IsCustomized);
        Assert.Empty(db.UserHuddlePlans);
    }

    [Fact]
    public async Task PlanQuery_ShouldNeverReturnAnotherUsersCustomization()
    {
        await using ApplicationDbContext db = CreateContext();
        await SeedCatalog(db);
        HuddlePlanResponse initial = await new GetMyHuddlePlanQueryHandler(db, new TestCurrentUserService("user-1"))
            .Handle(new GetMyHuddlePlanQuery("role-1"), default);
        SaveHuddlePlanItemRequest[] reversed = initial.Items.Reverse()
            .Select((item, index) => new SaveHuddlePlanItemRequest(6 + index, item.Huddle.ExternalId)).ToArray();
        await new SaveHuddlePlanCommandHandler(db, new TestCurrentUserService("user-1"))
            .Handle(new SaveHuddlePlanCommand("role-1", null, reversed), default);

        HuddlePlanResponse otherUser = await new GetMyHuddlePlanQueryHandler(db, new TestCurrentUserService("user-2"))
            .Handle(new GetMyHuddlePlanQuery("role-1"), default);
        Assert.False(otherUser.IsCustomized);
        Assert.Null(otherUser.RowVersion);
    }

    private static async Task SeedCatalog(ApplicationDbContext db)
    {
        Role role = new() { ExternalId = "role-1", Name = "Role", Abbreviation = "R", IsActive = true };
        HuddleSegmentRole segmentRole = new() { ExternalId = "segment-role-1", DisplayName = "Role", Role = role, HuddleSegment = new HuddleSegment { ExternalId = "segment-1", Name = "Segment" } };
        for (int index = 0; index < 7; index++)
        {
            HuddleTopic topic = new() { ExternalId = $"topic-{index + 1}", Name = $"Topic {index + 1}", Type = "Evergreen", PublicationStatus = "Published" };
            db.HuddleRolePathItems.Add(new HuddleRolePathItem { HuddleSegmentRole = segmentRole, WeekPosition = 6 + index, HuddleTopic = topic });
        }
        await db.SaveChangesAsync();
    }

    private static ApplicationDbContext CreateContext() => new(new DbContextOptionsBuilder<ApplicationDbContext>()
        .UseInMemoryDatabase(Guid.NewGuid().ToString()).Options);

    private sealed class TestCurrentUserService(string objectId) : ICurrentUserService
    {
        public bool IsAuthenticated => true;
        public string? ObjectId => objectId;
        public string? Email => "test@example.com";
        public string? DisplayName => "Test User";
        public IReadOnlyCollection<string> Roles => [];
    }
}
