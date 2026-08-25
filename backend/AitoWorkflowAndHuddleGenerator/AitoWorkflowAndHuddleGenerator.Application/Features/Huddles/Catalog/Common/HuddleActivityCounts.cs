using AitoWorkflowAndHuddleGenerator.Application.Abstractions.Persistence;
using Microsoft.EntityFrameworkCore;

namespace AitoWorkflowAndHuddleGenerator.Application.Features.Huddles.Catalog.Common;

/// <summary>
/// Loads per-topic activity counts for the catalog card.
/// </summary>
internal static class HuddleActivityCounts
{
    /// <summary>
    /// Counts activities per topic with a grouped projection, so the activity rows
    /// themselves are never materialised just to show a total on a card.
    /// </summary>
    public static async Task<IReadOnlyDictionary<int, int>> LoadAsync(
        IApplicationDbContext dbContext,
        IReadOnlyCollection<int> topicIds,
        CancellationToken cancellationToken)
    {
        if (topicIds.Count == 0) return new Dictionary<int, int>();

        return await dbContext.HuddleActivities.AsNoTracking()
            .Where(activity => topicIds.Contains(activity.HuddleTopicId))
            .GroupBy(activity => activity.HuddleTopicId)
            .Select(group => new { HuddleTopicId = group.Key, ActivityCount = group.Count() })
            .ToDictionaryAsync(row => row.HuddleTopicId, row => row.ActivityCount, cancellationToken);
    }
}
