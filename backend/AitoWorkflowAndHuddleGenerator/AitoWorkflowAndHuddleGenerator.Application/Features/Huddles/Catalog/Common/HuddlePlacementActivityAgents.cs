using AitoWorkflowAndHuddleGenerator.Application.Abstractions.Persistence;
using AitoWorkflowAndHuddleGenerator.Domain.Entities;
using AitoWorkflowAndHuddleGenerator.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace AitoWorkflowAndHuddleGenerator.Application.Features.Huddles.Catalog.Common;

/// <summary>
/// Loads the Primary-tagged agents a placement's own activities actually use, keyed by placement id.
/// </summary>
/// <remarks>
/// A shared topic's HuddleTopicAgents only proves broad topic-level relevance: WF-X-DEAL-01 tags
/// Sales Home Primary because some segment's activities use it, but that does not mean every segment
/// sharing the topic does. Nihar's direction was to stop reading the displayed Primary Agent from
/// the shared topic and instead project it from the selected Role Path's own placement -- its actual
/// Activities, via HuddleActivityAgents -- so Enterprise and SME&amp;C each see only the agents their
/// own activities use. This is read-only: HuddleTopicAgents is never touched by this projection.
/// </remarks>
internal static class HuddlePlacementActivityAgents
{
    private sealed record Row(int PlacementId, HuddleActivityAgent ActivityAgent);

    /// <summary>
    /// The distinct Primary-tagged HuddleActivityAgents for each named placement's own activities.
    /// "Active" here is the same scoping the rest of the catalog already uses for a placement's
    /// activities -- reached through HuddlePlacement.Activities, the same navigation
    /// HuddlePlacementLookup counts Featured/Extended activities through -- not a new definition.
    /// </summary>
    /// <remarks>
    /// There is no requirement to reduce a placement to one Primary Agent: a placement legitimately
    /// has several activities each tagging a different agent Primary, and all distinct agents are
    /// returned. Deduplication is by HuddleAgentId (the stable identifier), keeping the first row in
    /// activity-then-mapping display order when the same agent is tagged Primary on more than one
    /// activity, so the result is deterministic without inventing a priority between agents. One
    /// batched query covers every requested placement, so a caller resolving many placements at once
    /// (a catalog page, a role path, a saved plan) never issues one query per placement.
    /// </remarks>
    public static async Task<IReadOnlyDictionary<int, IReadOnlyList<HuddleActivityAgent>>> LoadPrimaryAsync(
        IApplicationDbContext dbContext,
        IReadOnlyCollection<int> placementIds,
        CancellationToken cancellationToken)
    {
        if (placementIds.Count == 0) return new Dictionary<int, IReadOnlyList<HuddleActivityAgent>>();

        List<int> ids = placementIds.Distinct().ToList();
        List<Row> rows = await dbContext.HuddleActivityAgents.AsNoTracking()
            .Include(x => x.HuddleAgent)
            .Where(x => x.UsageType == HuddleAgentUsageType.Primary
                && x.HuddleActivity.HuddlePlacementId != null
                && ids.Contains(x.HuddleActivity.HuddlePlacementId.Value))
            .OrderBy(x => x.HuddleActivity.DisplayOrder).ThenBy(x => x.DisplayOrder)
            .Select(x => new Row(x.HuddleActivity.HuddlePlacementId!.Value, x))
            .ToListAsync(cancellationToken);

        return rows
            .GroupBy(row => row.PlacementId)
            .ToDictionary(
                group => group.Key,
                group => (IReadOnlyList<HuddleActivityAgent>)group
                    .Select(row => row.ActivityAgent)
                    .GroupBy(activityAgent => activityAgent.HuddleAgentId)
                    .Select(byAgent => byAgent.First())
                    .ToList());
    }
}
