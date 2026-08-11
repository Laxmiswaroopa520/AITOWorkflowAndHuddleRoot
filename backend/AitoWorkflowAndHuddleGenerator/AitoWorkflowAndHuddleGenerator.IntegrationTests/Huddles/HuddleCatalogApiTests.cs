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
    public async Task RecommendedPath_ShouldReturnSevenUniqueTopicsForWeeksSixThroughTwelve()
    {
        await using ApplicationDbContext db = CreateContext();
        Role role = NewRole("role-a", 1);
        var segment = new HuddleSegment { ExternalId = "segment", Name = "Segment" };
        var segmentRole = new HuddleSegmentRole { ExternalId = "segment-role", DisplayName = "Role", Role = role, HuddleSegment = segment };
        List<HuddleTopic> topics = Enumerable.Range(1, 7).Select(i => NewTopic($"topic-{i}", $"Topic {i}", "Published", i)).ToList();
        for (int i = 0; i < topics.Count; i++) segmentRole.PathItems.Add(new HuddleRolePathItem { HuddleSegmentRole = segmentRole, HuddleTopic = topics[i], WeekPosition = i + 1 });
        segmentRole.PathItems.Add(new HuddleRolePathItem { HuddleSegmentRole = segmentRole, HuddleTopic = topics[0], WeekPosition = 8 });
        db.AddRange(role, segment, segmentRole); db.AddRange(topics);
        await db.SaveChangesAsync();

        var response = await new GetRecommendedPathQueryHandler(db).Handle(new GetRecommendedPathQuery("role-a"), default);

        Assert.True(response.IsComplete);
        Assert.Equal(7, response.Items.Count);
        Assert.Equal(Enumerable.Range(6, 7), response.Items.Select(x => x.Week));
        Assert.Equal(7, response.Items.Select(x => x.Huddle.ExternalId).Distinct().Count());
    }

    [Fact]
    public async Task RecommendedPath_ShouldReportIncompleteConfiguration()
    {
        await using ApplicationDbContext db = CreateContext();
        Role role = NewRole("role-a", 1);
        var segment = new HuddleSegment { ExternalId = "segment", Name = "Segment" };
        var segmentRole = new HuddleSegmentRole { ExternalId = "segment-role", DisplayName = "Role", Role = role, HuddleSegment = segment };
        for (int i = 1; i <= 3; i++) segmentRole.PathItems.Add(new HuddleRolePathItem { HuddleSegmentRole = segmentRole, HuddleTopic = NewTopic($"topic-{i}", $"Topic {i}", "Published", i), WeekPosition = i });
        db.AddRange(role, segment, segmentRole);
        await db.SaveChangesAsync();

        var response = await new GetRecommendedPathQueryHandler(db).Handle(new GetRecommendedPathQuery("role-a"), default);

        Assert.False(response.IsComplete);
        Assert.Equal(3, response.Items.Count);
        Assert.Contains("only 3", response.ConfigurationMessage);
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
}
