using AitoWorkflowAndHuddleGenerator.Application.Features.Huddles.Catalog.Common;
using AitoWorkflowAndHuddleGenerator.Contracts.Huddles;
using AitoWorkflowAndHuddleGenerator.Domain.Entities;

namespace AitoWorkflowAndHuddleGenerator.Application.Features.Huddles.Plans.Common;

/// <summary>
/// One week of a plan, already resolved: which week, which topic, which placement, and what the
/// role path recommends for that week.
/// </summary>
internal sealed record HuddlePlanWeek(
    int Week,
    HuddleTopic Topic,
    HuddlePlacementSummary? Placement,
    string RecommendedTopicExternalId,
    string? RecommendedPlacementExternalId);

/// <summary>
/// Maps Huddle Plan domain models to API contracts.
/// </summary>
internal static class HuddlePlanMappings
{
    /// <summary>
    /// Maps the resolved weeks to the plan response. Week numbers come from the data, never from a
    /// list index, so a path that starts at W1 stays at W1.
    /// </summary>
    public static HuddlePlanResponse ToResponse(
        string roleExternalId,
        byte[]? rowVersion,
        IReadOnlyList<HuddlePlanWeek> weeks,
        IReadOnlyDictionary<int, int> activityCounts)
    {
        List<HuddlePlanItemResponse> items = weeks.Select(week => new HuddlePlanItemResponse(
            week.Week,
            week.RecommendedTopicExternalId,
            IsCustomized(week),
            HuddleMappings.ToCatalogItem(week.Topic, activityCounts, week.Placement))).ToList();

        return new HuddlePlanResponse(
            roleExternalId,
            items.Any(item => item.IsCustomized),
            rowVersion is null || rowVersion.Length == 0 ? null : Convert.ToBase64String(rowVersion),
            items);
    }

    /// <summary>
    /// Compares placements when both are known, because a role path can hold the same topic in two
    /// weeks and swapping one for the other is a real customisation. Falls back to the topic when a
    /// placement is not available on either side.
    /// </summary>
    private static bool IsCustomized(HuddlePlanWeek week) =>
        week.RecommendedPlacementExternalId is not null && week.Placement is not null
            ? !string.Equals(week.Placement.ExternalId, week.RecommendedPlacementExternalId, StringComparison.OrdinalIgnoreCase)
            : !string.Equals(week.Topic.ExternalId, week.RecommendedTopicExternalId, StringComparison.OrdinalIgnoreCase);
}
