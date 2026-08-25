using System.Text.Json;
using AitoWorkflowAndHuddleGenerator.Contracts.Huddles;
using AitoWorkflowAndHuddleGenerator.Domain.Entities;
using AitoWorkflowAndHuddleGenerator.Domain.Enums;


//This HuddleMappings file is basically a translator.
//Its main job is to convert your Domain entities into Response DTO's..that are safe and convenient to send from your API to your React frontend:
namespace AitoWorkflowAndHuddleGenerator.Application.Features.Huddles.Catalog.Common;

/// <summary>
/// Maps Huddle domain models to API contracts.
/// </summary>
internal static class HuddleMappings                //static class means no need to create an object for this
                                                    //internal means the class is intended to be used only within this assembly/project.
{
    /// <summary>
    /// Maps a Huddle topic to the compact catalog-card response.
    /// </summary>
    /// <param name="placement">
    /// When supplied, the card reports that placement's identifier and its Featured and Extended
    /// counts, so a Role Path card shows one role's activity numbers rather than every role's.
    /// </param>
    public static HuddleCatalogItemResponse ToCatalogItem(
        HuddleTopic topic,
        IReadOnlyDictionary<int, int> activityCounts,
        HuddlePlacementSummary? placement = null)            //Small summary card information
    {
        return new HuddleCatalogItemResponse(
            topic.ExternalId,
            topic.Name,
            topic.Description,
            topic.Type,
            topic.HuddleFocusArea?.ExternalId,
            topic.HuddleFocusArea?.Name,
            topic.DurationMinutes,
            topic.RecommendationPriority,
            topic.AudienceDescription,
            topic.DesiredOutcome,
            topic.TopicRoles.OrderBy(x => x.Role.SortOrder).Select(ToRole).ToList(),
            topic.TopicAgents.Where(x => x.UsageType == HuddleAgentUsageType.Primary).OrderBy(x => x.DisplayOrder).Select(ToAgent).ToList(),
            topic.TopicAgents.Where(x => x.UsageType == HuddleAgentUsageType.Secondary).OrderBy(x => x.DisplayOrder).Select(ToAgent).ToList(),
            topic.McemStages.OrderBy(x => x.HuddleMcemStage.ExternalId).Select(x => new HuddleMcemStageResponse(
                x.HuddleMcemStage.ExternalId, x.HuddleMcemStage.Name,
                x.HuddleMcemStage.Description, x.DisplayOrder, x.HuddleMcemStage.StageNumber)).ToList(),
            activityCounts.TryGetValue(topic.Id, out int activityCount) ? activityCount : 0,
            placement?.ExternalId,
            placement?.FeaturedActivityCount,
            placement?.ExtendedActivityCount,
            placement?.RoleTopicName,
            placement?.RoleTopicDescription);
    }

    /// <summary>
    /// Maps a Huddle topic and governed agent resources to the complete detail response.
    /// </summary>
    /// <param name="placement">
    /// When supplied, phases, activities and the facilitator guide come from this placement, and the
    /// role-facing narrative overrides the topic's. When null the read stays topic-scoped, which
    /// aggregates every role sharing the topic.
    /// </param>
    public static HuddleDetailResponse ToDetail(
        HuddleTopic topic,
        IReadOnlyDictionary<int, IReadOnlyList<HuddleResourceResponse>> agentResources,
        HuddlePlacement? placement = null)
    {
        List<string> missingFields = GetMissingFields(topic);
        // A placement-scoped read takes that placement's three phases. A topic-scoped read takes
        // only phases that belong to no placement, which is pre-V4 content. Reading every phase on
        // the topic returned one Preparation, Explore and Practice and Commit to Action trio per
        // placement: six phases for a topic on two placements, eighteen for one on six.
        List<HuddlePhase> phases = (placement is null
            ? topic.Phases.Where(x => x.HuddlePlacementId is null)
            : placement.Phases).ToList();
        HuddleFacilitatorGuide? guide = placement is null ? SelectGuide(topic) : placement.FacilitatorGuide;
        return new HuddleDetailResponse(
            placement?.ExternalId,
            placement?.RoleTopicName,
            placement?.RoleTopicDescription,
            placement?.Wiifm,
            topic.ExternalId, topic.Name, topic.Description, topic.Type, topic.PublicationStatus,
            topic.HuddleFocusArea?.ExternalId, topic.HuddleFocusArea?.Name, topic.DurationMinutes,
            topic.RecommendationPriority,
            topic.TopicRoles.OrderBy(x => x.Role.SortOrder).Select(ToRole).ToList(),
            topic.AudienceDescription,
            placement?.TodayObjective ?? topic.TodayObjective,
            topic.UseCase,
            topic.WhyItMatters,
            placement?.DesiredOutcome ?? topic.DesiredOutcome,
            ParseList(topic.StepsToGetStarted),
            topic.McemStages.OrderBy(x => x.DisplayOrder).Select(x => new HuddleMcemStageResponse(
                x.HuddleMcemStage.ExternalId, x.HuddleMcemStage.Name,
                x.HuddleMcemStage.Description, x.DisplayOrder, x.HuddleMcemStage.StageNumber)).ToList(),
            topic.TopicAgents.Where(x => x.UsageType == HuddleAgentUsageType.Primary)
                .OrderBy(x => x.DisplayOrder).Select(x => ToAgent(x, GetResources(agentResources, x.HuddleAgentId))).ToList(),
            topic.TopicAgents.Where(x => x.UsageType == HuddleAgentUsageType.Secondary)
                .OrderBy(x => x.DisplayOrder).Select(x => ToAgent(x, GetResources(agentResources, x.HuddleAgentId))).ToList(),
            phases.OrderBy(x => x.DisplayOrder).Select(phase => new HuddlePhaseResponse(
                phase.ExternalId, phase.Name, phase.Description, phase.DurationMinutes, phase.DisplayOrder,
                phase.Activities.OrderBy(x => x.DisplayOrder)
                    .Select(activity => ToActivity(activity, agentResources)).ToList())).ToList(),
            ToFacilitatorGuide(guide),
            topic.TopicResources.OrderBy(x => x.DisplayOrder).Select(ToResource).ToList(),
            topic.ReflectionPrompt, topic.CommitmentPrompt, topic.KeyTakeaway,
            new HuddleContentAvailabilityResponse(
                topic.TodayObjective is not null && topic.UseCase is not null && topic.WhyItMatters is not null && topic.DesiredOutcome is not null,
                guide is not null,
                phases.Count != 0,
                phases.Sum(x => x.Activities.Count) != 0,
                topic.TopicAgents.Count != 0,
                topic.TopicResources.Count != 0,
                topic.ReflectionPrompt is not null,
                topic.CommitmentPrompt is not null,
                missingFields));
    }

    /// <summary>
    /// Chooses which facilitator guide to surface for a topic-scoped read.
    /// </summary>
    /// <remarks>
    /// V4 content stores one guide per placement, so a topic used by eight roles has eight guides.
    /// Without a placement in the request there is no principled way to choose between them, so
    /// this returns only a topic-level guide (one with no placement) and null otherwise, rather
    /// than presenting one arbitrary role's guide as if it belonged to the topic. Placement-scoped
    /// reads should select the guide by HuddlePlacementId instead.
    /// </remarks>
    private static HuddleFacilitatorGuide? SelectGuide(HuddleTopic topic) =>
        topic.FacilitatorGuides.SingleOrDefault(x => x.HuddlePlacementId is null);

    private static HuddleFacilitatorGuideResponse? ToFacilitatorGuide(HuddleFacilitatorGuide? guide) =>
        guide is null ? null : new HuddleFacilitatorGuideResponse(
            guide.SessionIntroduction,
            ParseList(guide.KeyTalkingPoints),
            ParseList(guide.DiscussionQuestions),
            ParseList(guide.SuggestedTransitions),
            guide.WrapUpGuidance,
            ParseList(guide.PreparationChecklist),
            ParseList(guide.FacilitatorQuestions),
            ParseList(guide.ListenFor),
            guide.FallbackGuidance,
            guide.ReflectPrompt,
            guide.CommitPrompt,
            ParseList(guide.BringBackEvidence));

    /// <summary>
    /// Maps an activity, including its practice tier and launch details.
    /// </summary>
    private static HuddleActivityResponse ToActivity(
        HuddleActivity activity,
        IReadOnlyDictionary<int, IReadOnlyList<HuddleResourceResponse>> agentResources) =>
        new(activity.ExternalId, activity.Name, activity.Description, activity.DurationMinutes,
            activity.DisplayOrder, activity.Prompt, activity.ExpectedOutput, activity.HumanCheckpoint,
            activity.RequiredContext, activity.BestFitJob,
            activity.PracticeTier.ToString(),
            activity.ExecutionMethod.ToString(),
            ParseList(activity.ActivitySteps),
            activity.WhyThisMatters,
            activity.LaunchUrl,
            activity.LaunchLabel,
            activity.PrerequisiteHuddleActivity?.ExternalId,
            activity.PrerequisiteHuddleActivity?.Name,
            activity.ActivityAgents.OrderBy(x => x.DisplayOrder)
                .Select(x => ToAgent(x, GetResources(agentResources, x.HuddleAgentId))).ToList(),
            activity.ActivityResources.OrderBy(x => x.DisplayOrder).Select(ToResource).ToList());

    private static HuddleRoleResponse ToRole(HuddleTopicRole mapping) =>
        new(mapping.Role.ExternalId, mapping.Role.Name, mapping.Role.Abbreviation, mapping.Role.Segment, mapping.Role.Description);

    private static HuddleAgentResponse ToAgent(HuddleTopicAgent mapping) =>
        ToAgent(mapping.HuddleAgent, mapping.UsageType.ToString(), mapping.DisplayLabel,
            mapping.ShowAgentAccessLink, mapping.DisplayOrder, []);

    private static HuddleAgentResponse ToAgent(
        HuddleTopicAgent mapping, IReadOnlyList<HuddleResourceResponse> resources) =>
        ToAgent(mapping.HuddleAgent, mapping.UsageType.ToString(), mapping.DisplayLabel,
            mapping.ShowAgentAccessLink, mapping.DisplayOrder, resources);

    private static HuddleAgentResponse ToAgent(
        HuddleActivityAgent mapping, IReadOnlyList<HuddleResourceResponse> resources) =>
        ToAgent(mapping.HuddleAgent, mapping.UsageType.ToString(), mapping.DisplayLabel,
            mapping.ShowAgentAccessLink, mapping.DisplayOrder, resources);

    private static HuddleAgentResponse ToAgent(
        HuddleAgent agent, string usageType, string? displayLabel, bool showAccessLink,
        int displayOrder, IReadOnlyList<HuddleResourceResponse> resources) =>
        new(agent.ExternalId, agent.Name, agent.ShortDescription, agent.WhatItIs,
            agent.WhatItHelpsYouDo, agent.WhenToUseIt, ParseList(agent.KeyBenefits),
            agent.WhenNotToUseIt, ParseList(agent.StepsToGetStarted),
            usageType, displayLabel, showAccessLink, agent.AccessUrl,
            agent.AccessLinkLabel, displayOrder, resources);

    private static HuddleResourceResponse ToResource(HuddleTopicResource mapping) =>
        ToResource(mapping.HuddleResource, mapping.DisplayOrder);

    private static HuddleResourceResponse ToResource(HuddleActivityResource mapping) =>
        ToResource(mapping.HuddleResource, mapping.DisplayOrder);

    /// <summary>
    /// Maps a Huddle resource and its display order to an API resource response.
    /// </summary>
    public static HuddleResourceResponse ToResource(HuddleResource resource, int displayOrder) =>
        new(resource.ExternalId, resource.Title, resource.Description, resource.Url,
            resource.Type, resource.LinkLabel, displayOrder);

    private static IReadOnlyList<HuddleResourceResponse> GetResources(
        IReadOnlyDictionary<int, IReadOnlyList<HuddleResourceResponse>> resources, int agentId) =>
        resources.TryGetValue(agentId, out IReadOnlyList<HuddleResourceResponse>? value) ? value : [];

    private static List<string> GetMissingFields(HuddleTopic topic)
    {
        var fields = new List<string>();
        if (topic.TodayObjective is null) fields.Add("narrative.todayObjective");
        if (topic.UseCase is null) fields.Add("narrative.useCase");
        if (topic.WhyItMatters is null) fields.Add("narrative.whyItMatters");
        if (topic.DesiredOutcome is null) fields.Add("narrative.desiredOutcome");
        if (topic.ReflectionPrompt is null) fields.Add("reflectionPrompt");
        if (topic.CommitmentPrompt is null) fields.Add("commitmentPrompt");
        if (topic.KeyTakeaway is null) fields.Add("keyTakeaway");
        return fields;
    }

    private static IReadOnlyList<string> ParseList(string? value)
    {
        if (string.IsNullOrWhiteSpace(value)) return [];
        try
        {
            return JsonSerializer.Deserialize<List<string>>(value) ?? [];
        }
        catch (JsonException)
        {
            return value.Split(['\r', '\n'], StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
        }
    }
}
