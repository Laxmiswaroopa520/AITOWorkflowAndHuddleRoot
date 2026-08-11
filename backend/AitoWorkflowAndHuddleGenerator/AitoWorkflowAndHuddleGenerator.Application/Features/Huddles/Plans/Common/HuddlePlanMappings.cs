using AitoWorkflowAndHuddleGenerator.Application.Features.Huddles.Catalog.Common;
using AitoWorkflowAndHuddleGenerator.Contracts.Huddles;
using AitoWorkflowAndHuddleGenerator.Domain.Entities;

namespace AitoWorkflowAndHuddleGenerator.Application.Features.Huddles.Plans.Common;

internal static class HuddlePlanMappings
{
    public static HuddlePlanResponse ToResponse(
        string roleExternalId,
        UserHuddlePlan? plan,
        IReadOnlyList<HuddleTopic> recommendedTopics)
    {
        IReadOnlyList<HuddleTopic> selectedTopics = plan is null
            ? recommendedTopics
            : plan.Items.OrderBy(item => item.WeekPosition).Select(item => item.HuddleTopic).ToList();

        List<HuddlePlanItemResponse> items = selectedTopics.Select((topic, index) =>
        {
            string recommendedExternalId = recommendedTopics[index].ExternalId;
            return new HuddlePlanItemResponse(
                6 + index,
                recommendedExternalId,
                !string.Equals(topic.ExternalId, recommendedExternalId, StringComparison.OrdinalIgnoreCase),
                HuddleMappings.ToCatalogItem(topic));
        }).ToList();

        return new HuddlePlanResponse(
            roleExternalId,
            items.Any(item => item.IsCustomized),
            plan is null || plan.RowVersion.Length == 0 ? null : Convert.ToBase64String(plan.RowVersion),
            items);
    }
}
