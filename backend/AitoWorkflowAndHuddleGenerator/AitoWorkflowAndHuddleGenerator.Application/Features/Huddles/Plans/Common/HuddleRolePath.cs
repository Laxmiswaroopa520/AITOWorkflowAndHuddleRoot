using AitoWorkflowAndHuddleGenerator.Application.Abstractions.Persistence;
using Microsoft.EntityFrameworkCore;

namespace AitoWorkflowAndHuddleGenerator.Application.Features.Huddles.Plans.Common;

/// <summary>
/// One week of the recommended path. A saved plan only needs the recommended topic's identifier to
/// decide whether a week was customised, so the full topic graph is not loaded for it.
/// </summary>
internal sealed record HuddleRecommendedTopic(int TopicId, string ExternalId);

/// <summary>
/// Reads the governed recommended path for a segment role.
/// </summary>
internal static class HuddleRolePath
{
    /// <summary>
    /// The first seven distinct published topics on the role path, ordered by week.
    /// </summary>
    public static async Task<IReadOnlyList<HuddleRecommendedTopic>> LoadRecommendedAsync(
        IApplicationDbContext dbContext,
        int segmentRoleId,
        CancellationToken cancellationToken)
    {
        var rows = await dbContext.HuddleRolePathItems.AsNoTracking()
            .Where(item => item.HuddleSegmentRoleId == segmentRoleId
                && item.HuddleTopic.PublicationStatus == "Published")
            .OrderBy(item => item.WeekPosition)
            .Select(item => new { item.HuddleTopicId, item.HuddleTopic.ExternalId })
            .ToListAsync(cancellationToken);

        return rows
            .GroupBy(row => row.HuddleTopicId)
            .Select(group => new HuddleRecommendedTopic(group.Key, group.First().ExternalId))
            .Take(7)
            .ToList();
    }
}
