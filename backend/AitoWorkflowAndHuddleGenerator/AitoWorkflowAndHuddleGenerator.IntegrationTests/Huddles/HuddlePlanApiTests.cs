using AitoWorkflowAndHuddleGenerator.Application.Abstractions.Identity;
using AitoWorkflowAndHuddleGenerator.Application.Features.Huddles.Plans.Common;
using AitoWorkflowAndHuddleGenerator.Application.Features.Huddles.Plans.Commands.ResetHuddlePlan;
using AitoWorkflowAndHuddleGenerator.Application.Features.Huddles.Plans.Commands.SaveHuddlePlan;
using AitoWorkflowAndHuddleGenerator.Application.Features.Huddles.Plans.Queries.GetMyHuddlePlan;
using AitoWorkflowAndHuddleGenerator.Contracts.Huddles;
using AitoWorkflowAndHuddleGenerator.Domain.Entities;
using AitoWorkflowAndHuddleGenerator.Domain.Enums;
using AitoWorkflowAndHuddleGenerator.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;

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
            .Select((item, index) => new SaveHuddlePlanItemRequest(1 + index, item.Huddle.ExternalId, item.Huddle.PlacementExternalId)).ToArray();
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
            .Select((item, index) => new SaveHuddlePlanItemRequest(1 + index, item.Huddle.ExternalId, item.Huddle.PlacementExternalId)).ToArray();
        await new SaveHuddlePlanCommandHandler(db, new TestCurrentUserService("user-1"))
            .Handle(new SaveHuddlePlanCommand("role-1", null, reversed), default);

        HuddlePlanResponse otherUser = await new GetMyHuddlePlanQueryHandler(db, new TestCurrentUserService("user-2"))
            .Handle(new GetMyHuddlePlanQuery("role-1"), default);
        Assert.False(otherUser.IsCustomized);
        Assert.Null(otherUser.RowVersion);
    }

    [Fact]
    public async Task PlanQuery_WithRolePathCache_ShouldReuseRecommendedPlanButNeverServeASavedPlan()
    {
        await using ApplicationDbContext db = CreateContext();
        await SeedCatalog(db);
        var cache = new RecommendedRolePathCache(new MemoryCache(new MemoryCacheOptions()));
        var user1 = new TestCurrentUserService("user-1");
        var cachedQuery = new GetMyHuddlePlanQueryHandler(db, user1, cache);

        HuddlePlanResponse first = await cachedQuery.Handle(new GetMyHuddlePlanQuery("role-1"), default);
        HuddlePlanResponse second = await cachedQuery.Handle(new GetMyHuddlePlanQuery("role-1"), default);
        Assert.Same(first, second);
        Assert.False(first.IsCustomized);

        SaveHuddlePlanItemRequest[] reversed = first.Items.Reverse()
            .Select((item, index) => new SaveHuddlePlanItemRequest(1 + index, item.Huddle.ExternalId, item.Huddle.PlacementExternalId)).ToArray();
        await new SaveHuddlePlanCommandHandler(db, user1)
            .Handle(new SaveHuddlePlanCommand("role-1", null, reversed), default);

        // The owner's saved plan is read fresh even though the recommended plan is cached...
        HuddlePlanResponse mine = await cachedQuery.Handle(new GetMyHuddlePlanQuery("role-1"), default);
        Assert.True(mine.IsCustomized);
        Assert.Equal(reversed.Select(item => item.HuddleExternalId), mine.Items.Select(item => item.Huddle.ExternalId));

        // ...and another user still gets the shared recommended plan, not user-1's customisation.
        HuddlePlanResponse otherUser = await new GetMyHuddlePlanQueryHandler(db, new TestCurrentUserService("user-2"), cache)
            .Handle(new GetMyHuddlePlanQuery("role-1"), default);
        Assert.Same(first, otherUser);
    }

    // The saved-plan response reuses HuddleMappings.ToCatalogItem, the same mapper the catalog and
    // detail surfaces use, so it must show the same placement-derived Primary Agents, not the
    // topic's shared TopicAgents. Regression coverage for the same Enterprise Sales Home leak,
    // exercised through the plan's recommended-week path (GetMyHuddlePlanQueryHandler.RecommendedWeeks).
    [Fact]
    public async Task Plan_ShouldProjectPrimaryAgentsFromPlacementActivitiesNotSharedTopicAgents()
    {
        await using ApplicationDbContext db = CreateContext();
        Role role = new() { ExternalId = "role-plan", Name = "Role", Abbreviation = "RP", IsActive = true };
        var segment = new HuddleSegment { ExternalId = "segment-plan", Name = "Segment" };
        HuddleSegmentRole segmentRole = new() { ExternalId = "sr-plan", DisplayName = "Role", Role = role, HuddleSegment = segment };
        HuddleTopic topic = new() { ExternalId = "topic-plan-1", Name = "Topic 1", Type = "Evergreen", PublicationStatus = "Published" };
        var salesAgent = new HuddleAgent { ExternalId = "sales-agent-plan", Name = "Sales Agent" };
        var salesHome = new HuddleAgent { ExternalId = "sales-home-plan", Name = "Sales Home" };
        topic.TopicAgents.Add(new HuddleTopicAgent { HuddleTopic = topic, HuddleAgent = salesHome, UsageType = HuddleAgentUsageType.Primary, DisplayOrder = 1 });
        var placement = new HuddlePlacement
        {
            ExternalId = "placement-plan-1", HuddleSegmentRole = segmentRole, HuddleTopic = topic,
            PathSection = "SEC-ROLEPATH", Sequence = 1, RoleTopicName = topic.Name, IsActive = true,
        };
        var phase = new HuddlePhase { ExternalId = "phase-plan-1", Name = "Phase", DisplayOrder = 1, HuddleTopic = topic };
        var activity = new HuddleActivity { ExternalId = "activity-plan-1", Name = "Activity", DisplayOrder = 1, HuddleTopic = topic, HuddlePhase = phase, HuddlePlacement = placement };
        activity.ActivityAgents.Add(new HuddleActivityAgent { HuddleActivity = activity, HuddleAgent = salesAgent, UsageType = HuddleAgentUsageType.Primary, DisplayOrder = 1 });
        db.AddRange(role, segment, segmentRole, topic, placement, phase, activity);
        await db.SaveChangesAsync();

        HuddlePlanResponse plan = await new GetMyHuddlePlanQueryHandler(db, new TestCurrentUserService("plan-user"))
            .Handle(new GetMyHuddlePlanQuery("role-plan"), default);

        HuddlePlanItemResponse week = Assert.Single(plan.Items);
        Assert.Equal(new[] { "Sales Agent" }, week.Huddle.PrimaryAgents.Select(x => x.Name));
        Assert.DoesNotContain(week.Huddle.PrimaryAgents, x => x.Name == "Sales Home");
    }

    // Rewritten for the HuddlePlacements model (see GetRecommendedPathQueryHandler's remarks, and
    // HuddleCatalogApiTests' RecommendedPath tests): GetMyHuddlePlanQueryHandler reads the role
    // path from HuddlePlacements via HuddleRolePathReader, not from HuddleRolePathItem, so seeding
    // the old entity produced an empty path and an empty plan here.
    //
    // The first attempt at this rewrite kept the original test's week numbers (2 through 8)
    // unchanged, which was wrong: IsContiguousFromWeekOne requires the run to start at week 1, so
    // that produced "must be a contiguous run of weeks starting at 1, but 7 placement(s) are
    // configured" instead of a usable path. Weeks are 1 through 7 here instead, and the two test
    // methods' own SaveHuddlePlanItemRequest week numbers were shifted to match -- a saved plan's
    // weeks have to exactly equal the recommended path's weeks (see CoversPath in
    // GetMyHuddlePlanQueryHandler) or reading it back throws too.
    //
    // A third fix was needed in the two tests' own "reversed" SaveHuddlePlanItemRequest arrays:
    // they only passed (Week, HuddleExternalId), leaving the request's optional PlacementExternalId
    // null. SaveHuddlePlanCommandHandler.ResolvePlacement falls back to that week's own recommended
    // placement whenever PlacementExternalId isn't supplied -- it exists specifically so a caller
    // can say which placement of a topic they mean, since one topic can appear at more than one
    // placement (see the doc comment on SaveHuddlePlanItemRequest, citing AE weeks 3 and 4). With no
    // PlacementExternalId, every saved week resolved back to its own recommended placement, so
    // HuddlePlanMappings.IsCustomized (which compares by placement whenever a recommended placement
    // is known, and only falls back to comparing topics when it isn't) found every week unchanged
    // and reported IsCustomized = false for the whole plan, even though the topics had been
    // reversed. Passing item.Huddle.PlacementExternalId (already present on the recommended
    // response) as the third argument fixes this: the save now names the actual placement being
    // requested for each week instead of implicitly keeping the recommended one.
    private static async Task SeedCatalog(ApplicationDbContext db)
    {
        Role role = new() { ExternalId = "role-1", Name = "Role", Abbreviation = "R", IsActive = true };
        HuddleSegmentRole segmentRole = new() { ExternalId = "segment-role-1", DisplayName = "Role", Role = role, HuddleSegment = new HuddleSegment { ExternalId = "segment-1", Name = "Segment" } };
        for (int index = 0; index < 7; index++)
        {
            HuddleTopic topic = new() { ExternalId = $"topic-{index + 1}", Name = $"Topic {index + 1}", Type = "Evergreen", PublicationStatus = "Published" };
            db.HuddlePlacements.Add(new HuddlePlacement
            {
                ExternalId = $"placement-{index + 1}",
                HuddleSegmentRole = segmentRole,
                HuddleTopic = topic,
                PathSection = "SEC-ROLEPATH",
                Sequence = 1 + index,
                RoleTopicName = topic.Name,
                IsActive = true,
            });
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
