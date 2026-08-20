using AitoWorkflowAndHuddleGenerator.Application.Features.Huddles.Catalog.Common;
using AitoWorkflowAndHuddleGenerator.Contracts.Huddles;
using AitoWorkflowAndHuddleGenerator.Domain.Entities;

namespace AitoWorkflowAndHuddleGenerator.Application.Features.Huddles.Plans.Common;

/// <summary>
/// Maps Huddle Plan domain models to API contracts.
/// </summary>
internal static class HuddlePlanMappings
{
    /// <summary>
    /// Maps a persisted or recommended Huddle plan to its ordered Weeks 2–8 response.
    /// </summary>
    public static HuddlePlanResponse ToResponse(
        string roleExternalId,
        UserHuddlePlan? plan,
        IReadOnlyList<HuddleTopic> recommendedTopics,
        IReadOnlyDictionary<int, int> activityCounts)
    {
        IReadOnlyList<HuddleTopic> selectedTopics = plan is null
            ? recommendedTopics
            : plan.Items.OrderBy(item => item.WeekPosition).Select(item => item.HuddleTopic).ToList();

        List<HuddlePlanItemResponse> items = selectedTopics.Select((topic, index) =>
        {
            string recommendedExternalId = recommendedTopics[index].ExternalId;
            return new HuddlePlanItemResponse(
                2 + index,
                recommendedExternalId,
                !string.Equals(topic.ExternalId, recommendedExternalId, StringComparison.OrdinalIgnoreCase),
                HuddleMappings.ToCatalogItem(topic, activityCounts));
        }).ToList();

        return new HuddlePlanResponse(
            roleExternalId,
            items.Any(item => item.IsCustomized),
            plan is null || plan.RowVersion.Length == 0 ? null : Convert.ToBase64String(plan.RowVersion),
            items);
    }
}
