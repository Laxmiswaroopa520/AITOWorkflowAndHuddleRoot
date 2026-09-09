using AitoWorkflowAndHuddleGenerator.Api.Authorization;
using AitoWorkflowAndHuddleGenerator.Api.Controllers;
using AitoWorkflowAndHuddleGenerator.Application.Common.Exceptions;
using AitoWorkflowAndHuddleGenerator.Application.Features.Huddles.Catalog.Queries.GetHuddleById;
using AitoWorkflowAndHuddleGenerator.Application.Features.Huddles.Catalog.Queries.GetHuddleCatalog;
using AitoWorkflowAndHuddleGenerator.Application.Features.Huddles.Catalog.Queries.GetRecommendedPath;
using AitoWorkflowAndHuddleGenerator.Contracts.Huddles;
using AitoWorkflowAndHuddleGenerator.Domain.Entities;
using AitoWorkflowAndHuddleGenerator.Domain.Enums;
using AitoWorkflowAndHuddleGenerator.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;

namespace AitoWorkflowAndHuddleGenerator.IntegrationTests.Huddles;

public sealed class HuddleCatalogApiTests
{
    [Fact]
    public void Controller_ShouldRequireAccessAsUserPolicy()
    {
        AuthorizeAttribute attribute = Assert.Single(typeof(HuddlesController)
            .GetCustomAttributes(typeof(AuthorizeAttribute), true).Cast<AuthorizeAttribute>());
        Assert.Equal(Policies.AccessAsUser, attribute.Policy);
    }

    [Fact]
    public async Task Catalog_ShouldFilterSearchOrderAndExcludeDrafts()
    {
        await using ApplicationDbContext db = CreateContext();
        Role role = NewRole("role-a", 1);
        var focus = new HuddleFocusArea { ExternalId = "focus-sales", Name = "Sales" };
        var agent = new HuddleAgent { ExternalId = "agent-a", Name = "Agent A" };
        HuddleTopic match = NewTopic("published-match", "Pipeline Planning", "Published", 2);
        match.HuddleFocusArea = focus;
        match.TopicRoles.Add(new HuddleTopicRole { HuddleTopic = match, Role = role });
        match.TopicAgents.Add(new HuddleTopicAgent { HuddleTopic = match, HuddleAgent = agent, UsageType = HuddleAgentUsageType.Primary, DisplayOrder = 1 });
        HuddleTopic second = NewTopic("published-second", "Other", "Published", 1);
        HuddleTopic draft = NewTopic("draft", "Pipeline Draft", "WorkingDraft", 0);
        db.AddRange(role, focus, agent, match, second, draft);
        await db.SaveChangesAsync();

        var handler = new GetHuddleCatalogQueryHandler(db);
        var result = await handler.Handle(new GetHuddleCatalogQuery("role-a", "focus-sales", "agent-a", "Prescriptive", "Pipeline", "priority"), default);

        HuddleCatalogItemResponse item = Assert.Single(result);
        Assert.Equal("published-match", item.ExternalId);
        Assert.DoesNotContain(result, x => x.ExternalId == "draft");
        Assert.Single(item.PrimaryAgents);
    }

    [Fact]
    public async Task Detail_ShouldPreserveMissingContentAndMapRelationships()
    {
        await using ApplicationDbContext db = CreateContext();
        HuddleTopic topic = NewTopic("detail", "Detail", "Published", 1);
        var phase = new HuddlePhase { ExternalId = "phase", Name = "Phase", DisplayOrder = 1, HuddleTopic = topic };
        var activity = new HuddleActivity { ExternalId = "activity", Name = "Activity", DisplayOrder = 1, HuddleTopic = topic, HuddlePhase = phase };
        var resource = new HuddleResource { ExternalId = "resource", Title = "Resource" };
        var agent = new HuddleAgent { ExternalId = "agent", Name = "Agent" };
        topic.TopicAgents.Add(new HuddleTopicAgent
        {
            HuddleTopic = topic, HuddleAgent = agent,
            UsageType = HuddleAgentUsageType.Primary, DisplayOrder = 1
        });
        activity.ActivityResources.Add(new HuddleActivityResource { HuddleActivity = activity, HuddleResource = resource, DisplayOrder = 1 });
        phase.Activities.Add(activity);
        topic.Phases.Add(phase);
        db.AddRange(topic, resource, agent,
            new HuddleAgentResource { HuddleAgent = agent, HuddleResource = resource, DisplayOrder = 1 });
        await db.SaveChangesAsync();

        var response = await new GetHuddleByIdQueryHandler(db).Handle(new GetHuddleByIdQuery("detail"), default);

        Assert.Null(response.TodayObjective);
        Assert.Contains("narrative.todayObjective", response.ContentAvailability.MissingFields);
        Assert.Single(response.Phases);
        Assert.Single(response.Phases[0].Activities[0].Resources);
        Assert.Single(response.PrimaryAgents[0].Resources);
    }

    [Fact]
    public async Task Detail_ShouldNotExposeDraftOrUnknownHuddle()
    {
        await using ApplicationDbContext db = CreateContext();
        db.Add(NewTopic("draft", "Draft", "WorkingDraft", 1));
        await db.SaveChangesAsync();
        var handler = new GetHuddleByIdQueryHandler(db);
        await Assert.ThrowsAsync<NotFoundException>(() => handler.Handle(new GetHuddleByIdQuery("draft"), default));
        await Assert.ThrowsAsync<NotFoundException>(() => handler.Handle(new GetHuddleByIdQuery("missing"), default));
    }

    [Fact]
    public async Task RecommendedPath_ShouldReturnContiguousWeeksWithARevisitedTopic()
    {
        // Rewritten for the HuddlePlacements model (see GetRecommendedPathQueryHandler's own
        // remarks: the path is read from HuddlePlacements, keyed by each placement's Sequence),
        // because a role can revisit the same topic in more than one week -- the real ATS and SE
        // role paths each repeat one topic three times. This seeds that same shape: seven topics
        // across a contiguous eight-week path, with topic-1 shown again at week 8, and proves
        // both visits are kept -- neither dropped nor collapsed into one -- which is the specific
        // bug this data model migration fixed (the old HuddleRolePathItem read could not tell
        // apart a topic's two visits, so it silently lost weeks).
        await using ApplicationDbContext db = CreateContext();
        Role role = NewRole("role-a", 1);
        var segment = new HuddleSegment { ExternalId = "segment", Name = "Segment" };
        var segmentRole = new HuddleSegmentRole { ExternalId = "segment-role", DisplayName = "Role", Role = role, HuddleSegment = segment };
        List<HuddleTopic> topics = Enumerable.Range(1, 7).Select(i => NewTopic($"topic-{i}", $"Topic {i}", "Published", i)).ToList();
        List<HuddlePlacement> placements = [];
        for (int i = 0; i < topics.Count; i++)
            placements.Add(NewPlacement($"placement-{i + 1}", segmentRole, topics[i], i + 1));
        // Week 8 revisits topic-1, the same shape as ATS repeating WF-X-CONV-01 across its path.
        placements.Add(NewPlacement("placement-8", segmentRole, topics[0], 8));
        db.AddRange(role, segment, segmentRole);
        db.AddRange(topics);
        db.AddRange(placements);
        await db.SaveChangesAsync();

        var response = await new GetRecommendedPathQueryHandler(db).Handle(new GetRecommendedPathQuery("role-a"), default);

        Assert.True(response.IsComplete);
        Assert.Equal(8, response.Items.Count);
        Assert.Equal(Enumerable.Range(1, 8), response.Items.Select(x => x.Week));
        // Six topics appear once and topic-1 appears twice: seven distinct topics across eight items.
        Assert.Equal(7, response.Items.Select(x => x.Huddle.ExternalId).Distinct().Count());
        Assert.Equal("topic-1", response.Items[0].Huddle.ExternalId);
        Assert.Equal("topic-1", response.Items[7].Huddle.ExternalId);
    }

    [Fact]
    public async Task RecommendedPath_ShouldReportIncompleteConfigurationForANonContiguousPath()
    {
        // Rewritten for the HuddlePlacements model. Completeness is now defined by
        // HuddleRolePathReader.IsContiguousFromWeekOne -- a run of weeks starting at 1 with no
        // gaps -- not by reaching some fixed total. Three sequential weeks (1-2-3) is therefore a
        // valid, complete three-week path under the current rule, so the incomplete case this
        // test needs to prove is a gap in the sequence: weeks 1, 2 and 4, with week 3 missing.
        await using ApplicationDbContext db = CreateContext();
        Role role = NewRole("role-a", 1);
        var segment = new HuddleSegment { ExternalId = "segment", Name = "Segment" };
        var segmentRole = new HuddleSegmentRole { ExternalId = "segment-role", DisplayName = "Role", Role = role, HuddleSegment = segment };
        int[] sequences = [1, 2, 4];
        List<HuddleTopic> topics = sequences.Select(week => NewTopic($"topic-{week}", $"Topic {week}", "Published", week)).ToList();
        List<HuddlePlacement> placements = [];
        for (int i = 0; i < sequences.Length; i++)
            placements.Add(NewPlacement($"placement-{i + 1}", segmentRole, topics[i], sequences[i]));
        db.AddRange(role, segment, segmentRole);
        db.AddRange(topics);
        db.AddRange(placements);
        await db.SaveChangesAsync();

        var response = await new GetRecommendedPathQueryHandler(db).Handle(new GetRecommendedPathQuery("role-a"), default);

        Assert.False(response.IsComplete);
        Assert.Equal(3, response.Items.Count);
        Assert.Contains("must be a contiguous run of weeks starting at 1", response.ConfigurationMessage);
    }

    [Fact]
    public async Task RecommendedPath_ShouldRejectUnknownRole()
    {
        await using ApplicationDbContext db = CreateContext();
        await Assert.ThrowsAsync<NotFoundException>(() => new GetRecommendedPathQueryHandler(db)
            .Handle(new GetRecommendedPathQuery("unknown"), default));
    }

    private static ApplicationDbContext CreateContext()
    {
        DbContextOptions<ApplicationDbContext> options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString()).Options;
        return new ApplicationDbContext(options);
    }

    private static Role NewRole(string externalId, int sortOrder) => new()
    {
        ExternalId = externalId, Name = externalId, Abbreviation = externalId, SortOrder = sortOrder, IsActive = true
    };

    private static HuddleTopic NewTopic(string externalId, string name, string status, int priority) => new()
    {
        ExternalId = externalId, Name = name, Type = "Prescriptive", PublicationStatus = status,
        RecommendationPriority = priority
    };

    private static HuddlePlacement NewPlacement(string externalId, HuddleSegmentRole segmentRole, HuddleTopic topic, int sequence) => new()
    {
        ExternalId = externalId,
        HuddleSegmentRole = segmentRole,
        HuddleTopic = topic,
        PathSection = "SEC-ROLEPATH",
        Sequence = sequence,
        RoleTopicName = topic.Name,
        IsActive = true,
    };
}
