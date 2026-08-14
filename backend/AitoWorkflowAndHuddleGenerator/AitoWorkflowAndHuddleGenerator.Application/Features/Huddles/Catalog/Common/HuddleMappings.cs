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
    public static HuddleCatalogItemResponse ToCatalogItem(HuddleTopic topic)            //Small summary card information
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
            topic.TopicAgents.Where(x => x.UsageType == HuddleAgentUsageType.Secondary).OrderBy(x => x.DisplayOrder).Select(ToAgent).ToList());
    }

    /// <summary>
    /// Maps a Huddle topic and governed agent resources to the complete detail response.
    /// </summary>
    public static HuddleDetailResponse ToDetail(
        HuddleTopic topic,
        IReadOnlyDictionary<int, IReadOnlyList<HuddleResourceResponse>> agentResources)                         //Complete Huddle Information for the Huddle Detail Page..
    {

        List<string> missingFields = GetMissingFields(topic);
        return new HuddleDetailResponse(
            topic.ExternalId, topic.Name, topic.Description, topic.Type, topic.PublicationStatus,
            topic.HuddleFocusArea?.ExternalId, topic.HuddleFocusArea?.Name, topic.DurationMinutes,
            topic.RecommendationPriority,
            topic.TopicRoles.OrderBy(x => x.Role.SortOrder).Select(ToRole).ToList(),
            topic.AudienceDescription, topic.TodayObjective, topic.UseCase, topic.WhyItMatters,
            topic.DesiredOutcome, ParseList(topic.StepsToGetStarted),
            topic.McemStages.OrderBy(x => x.DisplayOrder).Select(x => new HuddleMcemStageResponse(
                x.HuddleMcemStage.ExternalId, x.HuddleMcemStage.Name,
                x.HuddleMcemStage.Description, x.DisplayOrder)).ToList(),
            topic.TopicAgents.Where(x => x.UsageType == HuddleAgentUsageType.Primary)
                .OrderBy(x => x.DisplayOrder).Select(x => ToAgent(x, GetResources(agentResources, x.HuddleAgentId))).ToList(),
            topic.TopicAgents.Where(x => x.UsageType == HuddleAgentUsageType.Secondary)
                .OrderBy(x => x.DisplayOrder).Select(x => ToAgent(x, GetResources(agentResources, x.HuddleAgentId))).ToList(),
            topic.Phases.OrderBy(x => x.DisplayOrder).Select(phase => new HuddlePhaseResponse(
                phase.ExternalId, phase.Name, phase.Description, phase.DurationMinutes, phase.DisplayOrder,
                phase.Activities.OrderBy(x => x.DisplayOrder).Select(activity => new HuddleActivityResponse(
                    activity.ExternalId, activity.Name, activity.Description, activity.DurationMinutes,
                    activity.DisplayOrder, activity.Prompt, activity.ExpectedOutput, activity.HumanCheckpoint,
                    activity.RequiredContext, activity.BestFitJob,
                    activity.ActivityAgents.OrderBy(x => x.DisplayOrder)
                        .Select(x => ToAgent(x, GetResources(agentResources, x.HuddleAgentId))).ToList(),
                    activity.ActivityResources.OrderBy(x => x.DisplayOrder).Select(ToResource).ToList())).ToList())).ToList(),
            topic.FacilitatorGuide is null ? null : new HuddleFacilitatorGuideResponse(
                topic.FacilitatorGuide.SessionIntroduction,
                ParseList(topic.FacilitatorGuide.KeyTalkingPoints),
                ParseList(topic.FacilitatorGuide.DiscussionQuestions),
                ParseList(topic.FacilitatorGuide.SuggestedTransitions),
                topic.FacilitatorGuide.WrapUpGuidance),
            topic.TopicResources.OrderBy(x => x.DisplayOrder).Select(ToResource).ToList(),
            topic.ReflectionPrompt, topic.CommitmentPrompt, topic.KeyTakeaway,
            new HuddleContentAvailabilityResponse(
                topic.TodayObjective is not null && topic.UseCase is not null && topic.WhyItMatters is not null && topic.DesiredOutcome is not null,
                topic.FacilitatorGuide is not null,
                topic.Phases.Count != 0,
                topic.Activities.Count != 0,
                topic.TopicAgents.Count != 0,
                topic.TopicResources.Count != 0,
                topic.ReflectionPrompt is not null,
                topic.CommitmentPrompt is not null,
                missingFields));
    }

    private static HuddleRoleResponse ToRole(HuddleTopicRole mapping) =>
        new(mapping.Role.ExternalId, mapping.Role.Name, mapping.Role.Abbreviation, mapping.Role.Segment);

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
