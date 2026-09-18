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

    // Regression coverage for the Enterprise Sales Home leak: HuddleTopicAgents is shared, broad
    // topic-level relevance data (WF-X-DEAL-01 tags Sales Agent, Sales Home and Deal Agent Primary,
    // for whichever segment needs each), and must never be read as "the" Primary Agent for a
    // specific Role Path. The Primary Agent shown on a card has to come from the selected
    // placement's own Activities via HuddleActivityAgents instead, so Enterprise sees only the
    // agents its own activities use, and a placement whose activities tag several agents Primary
    // (mirroring the real SSP-DEAL/SSP-COMP data, which has four and seven respectively) shows all
    // of them rather than being collapsed to one.
    [Fact]
    public async Task Catalog_ShouldProjectPrimaryAgentsFromPlacementActivitiesNotSharedTopicAgents()
    {
        await using ApplicationDbContext db = CreateContext();
        Role role = NewRole("role-ent", 1);
        var segment = new HuddleSegment { ExternalId = "segment-ent", Name = "Enterprise" };
        var segmentRole = new HuddleSegmentRole { ExternalId = "sr-ent", DisplayName = "Role", Role = role, HuddleSegment = segment };
        HuddleTopic topic = NewTopic("shared-topic", "Shared Topic", "Published", 1);
        topic.TopicRoles.Add(new HuddleTopicRole { HuddleTopic = topic, Role = role });

        var salesAgent = new HuddleAgent { ExternalId = "sales-agent", Name = "Sales Agent" };
        var salesHome = new HuddleAgent { ExternalId = "sales-home", Name = "Sales Home" };
        var dealAgent = new HuddleAgent { ExternalId = "deal-agent", Name = "Deal Agent" };
        var msxi = new HuddleAgent { ExternalId = "msxi", Name = "MSXI Assist V2" };
        var copilot = new HuddleAgent { ExternalId = "copilot", Name = "Microsoft 365 Copilot" };
        var cowork = new HuddleAgent { ExternalId = "cowork", Name = "Cowork" };
        var researcher = new HuddleAgent { ExternalId = "researcher", Name = "Researcher" };

        // The shared topic-level mapping. Must stay exactly as authored -- untouched by this fix --
        // and must not be what the card reads its Primary Agents from.
        topic.TopicAgents.Add(new HuddleTopicAgent { HuddleTopic = topic, HuddleAgent = salesAgent, UsageType = HuddleAgentUsageType.Primary, DisplayOrder = 1 });
        topic.TopicAgents.Add(new HuddleTopicAgent { HuddleTopic = topic, HuddleAgent = salesHome, UsageType = HuddleAgentUsageType.Primary, DisplayOrder = 2 });
        topic.TopicAgents.Add(new HuddleTopicAgent { HuddleTopic = topic, HuddleAgent = dealAgent, UsageType = HuddleAgentUsageType.Primary, DisplayOrder = 3 });
        topic.TopicAgents.Add(new HuddleTopicAgent { HuddleTopic = topic, HuddleAgent = researcher, UsageType = HuddleAgentUsageType.Secondary, DisplayOrder = 4 });

        var placement = new HuddlePlacement
        {
            ExternalId = "placement-ent", HuddleSegmentRole = segmentRole, HuddleTopic = topic,
            PathSection = "SEC-ROLEPATH", Sequence = 1, RoleTopicName = topic.Name, IsActive = true,
        };
        var phase = new HuddlePhase { ExternalId = "phase-ent", Name = "Phase", DisplayOrder = 1, HuddleTopic = topic };
        var activity1 = new HuddleActivity { ExternalId = "activity-1", Name = "Activity 1", DisplayOrder = 1, HuddleTopic = topic, HuddlePhase = phase, HuddlePlacement = placement };
        var activity2 = new HuddleActivity { ExternalId = "activity-2", Name = "Activity 2", DisplayOrder = 2, HuddleTopic = topic, HuddlePhase = phase, HuddlePlacement = placement };
        activity1.ActivityAgents.Add(new HuddleActivityAgent { HuddleActivity = activity1, HuddleAgent = salesAgent, UsageType = HuddleAgentUsageType.Primary, DisplayOrder = 1 });
        activity1.ActivityAgents.Add(new HuddleActivityAgent { HuddleActivity = activity1, HuddleAgent = msxi, UsageType = HuddleAgentUsageType.Primary, DisplayOrder = 2 });
        activity2.ActivityAgents.Add(new HuddleActivityAgent { HuddleActivity = activity2, HuddleAgent = copilot, UsageType = HuddleAgentUsageType.Primary, DisplayOrder = 1 });
        activity2.ActivityAgents.Add(new HuddleActivityAgent { HuddleActivity = activity2, HuddleAgent = cowork, UsageType = HuddleAgentUsageType.Primary, DisplayOrder = 2 });
        // Sales Agent tagged Primary again on a second activity, to prove de-duplication is by
        // agent identity, not by row: it must appear once, not twice.
        activity2.ActivityAgents.Add(new HuddleActivityAgent { HuddleActivity = activity2, HuddleAgent = salesAgent, UsageType = HuddleAgentUsageType.Primary, DisplayOrder = 3 });

        db.AddRange(role, segment, segmentRole, topic, placement, phase, activity1, activity2);
        await db.SaveChangesAsync();

        var handler = new GetHuddleCatalogQueryHandler(db);
        var result = await handler.Handle(
            new GetHuddleCatalogQuery(null, null, null, null, null, null, "role-ent"), default);

        HuddleCatalogItemResponse item = Assert.Single(result);
        Assert.Equal(
            new[] { "Sales Agent", "MSXI Assist V2", "Microsoft 365 Copilot", "Cowork" },
            item.PrimaryAgents.Select(x => x.Name));
        Assert.DoesNotContain(item.PrimaryAgents, x => x.Name == "Sales Home");
        Assert.DoesNotContain(item.PrimaryAgents, x => x.Name == "Deal Agent");
        // Secondary Agents are out of scope for this fix and must remain topic-sourced.
        Assert.Single(item.SecondaryAgents);
        Assert.Equal("Researcher", item.SecondaryAgents[0].Name);
    }

    // Proves the projection is placement-scoped, not topic-wide: the same shared topic on two
    // different segment/role placements (an Enterprise-like one and an SME&C-like one) shows each
    // placement's own activity-derived agents, and neither leaks into the other. This is the direct
    // regression check for Nihar's SME&C preservation requirement.
    [Fact]
    public async Task Catalog_ShouldVaryPrimaryAgentsByPlacementForSameSharedTopic()
    {
        await using ApplicationDbContext db = CreateContext();
        Role entRole = NewRole("role-ent-3", 1);
        Role smecRole = NewRole("role-smec-3", 2);
        var entSegment = new HuddleSegment { ExternalId = "segment-ent-3", Name = "Enterprise" };
        var smecSegment = new HuddleSegment { ExternalId = "segment-smec-3", Name = "SME&C" };
        var entSegmentRole = new HuddleSegmentRole { ExternalId = "sr-ent-3", DisplayName = "Role", Role = entRole, HuddleSegment = entSegment };
        var smecSegmentRole = new HuddleSegmentRole { ExternalId = "sr-smec-3", DisplayName = "Role", Role = smecRole, HuddleSegment = smecSegment };
        HuddleTopic topic = NewTopic("shared-varied", "Shared Varied Topic", "Published", 1);

        var salesAgent = new HuddleAgent { ExternalId = "sales-agent-3", Name = "Sales Agent" };
        var salesHome = new HuddleAgent { ExternalId = "sales-home-3", Name = "Sales Home" };
        var dealHome = new HuddleAgent { ExternalId = "deal-home-3", Name = "Deal Home" };

        var entPlacement = new HuddlePlacement { ExternalId = "placement-ent-3", HuddleSegmentRole = entSegmentRole, HuddleTopic = topic, PathSection = "SEC-ROLEPATH", Sequence = 1, RoleTopicName = topic.Name, IsActive = true };
        var smecPlacement = new HuddlePlacement { ExternalId = "placement-smec-3", HuddleSegmentRole = smecSegmentRole, HuddleTopic = topic, PathSection = "SEC-ROLEPATH", Sequence = 1, RoleTopicName = topic.Name, IsActive = true };
        var entPhase = new HuddlePhase { ExternalId = "phase-ent-3", Name = "Phase", DisplayOrder = 1, HuddleTopic = topic };
        var smecPhase = new HuddlePhase { ExternalId = "phase-smec-3", Name = "Phase", DisplayOrder = 1, HuddleTopic = topic };
        var entActivity = new HuddleActivity { ExternalId = "activity-ent-3", Name = "Activity", DisplayOrder = 1, HuddleTopic = topic, HuddlePhase = entPhase, HuddlePlacement = entPlacement };
        var smecActivity = new HuddleActivity { ExternalId = "activity-smec-3", Name = "Activity", DisplayOrder = 1, HuddleTopic = topic, HuddlePhase = smecPhase, HuddlePlacement = smecPlacement };
        entActivity.ActivityAgents.Add(new HuddleActivityAgent { HuddleActivity = entActivity, HuddleAgent = salesAgent, UsageType = HuddleAgentUsageType.Primary, DisplayOrder = 1 });
        smecActivity.ActivityAgents.Add(new HuddleActivityAgent { HuddleActivity = smecActivity, HuddleAgent = salesHome, UsageType = HuddleAgentUsageType.Primary, DisplayOrder = 1 });
        smecActivity.ActivityAgents.Add(new HuddleActivityAgent { HuddleActivity = smecActivity, HuddleAgent = dealHome, UsageType = HuddleAgentUsageType.Primary, DisplayOrder = 2 });

        db.AddRange(entRole, smecRole, entSegment, smecSegment, entSegmentRole, smecSegmentRole,
            topic, entPlacement, smecPlacement, entPhase, smecPhase, entActivity, smecActivity);
        await db.SaveChangesAsync();

        var handler = new GetHuddleCatalogQueryHandler(db);
        var entResult = await handler.Handle(new GetHuddleCatalogQuery(null, null, null, null, null, null, "role-ent-3"), default);
        var smecResult = await handler.Handle(new GetHuddleCatalogQuery(null, null, null, null, null, null, "role-smec-3"), default);

        HuddleCatalogItemResponse entItem = Assert.Single(entResult);
        HuddleCatalogItemResponse smecItem = Assert.Single(smecResult);
        Assert.Equal(new[] { "Sales Agent" }, entItem.PrimaryAgents.Select(x => x.Name));
        Assert.Equal(new[] { "Sales Home", "Deal Home" }, smecItem.PrimaryAgents.Select(x => x.Name));
    }

    // The GetHuddleById detail panel has its own Primary Agent block (separate from the catalog
    // card), fed by the placement it already eagerly loads. Same regression, different handler.
    [Fact]
    public async Task Detail_ShouldProjectPrimaryAgentsFromPlacementActivitiesNotSharedTopicAgents()
    {
        await using ApplicationDbContext db = CreateContext();
        Role role = NewRole("role-ent-2", 1);
        var segment = new HuddleSegment { ExternalId = "segment-ent-2", Name = "Enterprise" };
        var segmentRole = new HuddleSegmentRole { ExternalId = "sr-ent-2", DisplayName = "Role", Role = role, HuddleSegment = segment };
        HuddleTopic topic = NewTopic("shared-detail", "Shared Detail Topic", "Published", 1);

        var salesAgent = new HuddleAgent { ExternalId = "sales-agent-d", Name = "Sales Agent" };
        var salesHome = new HuddleAgent { ExternalId = "sales-home-d", Name = "Sales Home" };
        topic.TopicAgents.Add(new HuddleTopicAgent { HuddleTopic = topic, HuddleAgent = salesAgent, UsageType = HuddleAgentUsageType.Primary, DisplayOrder = 1 });
        topic.TopicAgents.Add(new HuddleTopicAgent { HuddleTopic = topic, HuddleAgent = salesHome, UsageType = HuddleAgentUsageType.Primary, DisplayOrder = 2 });

        var placement = new HuddlePlacement
        {
            ExternalId = "placement-detail", HuddleSegmentRole = segmentRole, HuddleTopic = topic,
            PathSection = "SEC-ROLEPATH", Sequence = 1, RoleTopicName = topic.Name, IsActive = true,
        };
        var phase = new HuddlePhase { ExternalId = "phase-detail", Name = "Phase", DisplayOrder = 1, HuddleTopic = topic };
        var activity = new HuddleActivity { ExternalId = "activity-detail", Name = "Activity", DisplayOrder = 1, HuddleTopic = topic, HuddlePhase = phase, HuddlePlacement = placement };
        activity.ActivityAgents.Add(new HuddleActivityAgent { HuddleActivity = activity, HuddleAgent = salesAgent, UsageType = HuddleAgentUsageType.Primary, DisplayOrder = 1 });
        phase.Activities.Add(activity);
        placement.Phases.Add(phase);

        db.AddRange(role, segment, segmentRole, topic, placement, phase, activity);
        await db.SaveChangesAsync();

        var response = await new GetHuddleByIdQueryHandler(db)
            .Handle(new GetHuddleByIdQuery("shared-detail", "placement-detail"), default);

        Assert.Single(response.PrimaryAgents);
        Assert.Equal("Sales Agent", response.PrimaryAgents[0].Name);
        Assert.DoesNotContain(response.PrimaryAgents, x => x.Name == "Sales Home");
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
