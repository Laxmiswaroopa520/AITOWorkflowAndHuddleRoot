using System.Linq.Expressions;
using AitoWorkflowAndHuddleGenerator.Application.Abstractions.Persistence;
using AitoWorkflowAndHuddleGenerator.Domain.Entities;
using AitoWorkflowAndHuddleGenerator.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace AitoWorkflowAndHuddleGenerator.Application.Features.Huddles.Catalog.Common;

/// <summary>
/// The three values a catalogue card needs from a placement: which placement to open, and how the
/// role's activities split across the two practice tiers.
/// </summary>
internal sealed record HuddlePlacementSummary(
    string ExternalId,
    int FeaturedActivityCount,
    int ExtendedActivityCount,
    /// <summary>The role-facing title from Role_Paths.RoleTopicName, when the placement has one.</summary>
    string? RoleTopicName = null,
    /// <summary>The role-facing description from Role_Paths.RoleTopicDescription.</summary>
    string? RoleTopicDescription = null);

internal sealed record HuddlePlacementRow(
    int HuddleTopicId,
    string ExternalId,
    int FeaturedActivityCount,
    int ExtendedActivityCount,
    string? RoleTopicName,
    string? RoleTopicDescription);

/// <summary>
/// Resolves which placement of a topic to open, and that placement's activity split.
/// </summary>
/// <remarks>
/// A topic sits on several placements, one per role, each with its own phases and activities. Every
/// read has to name exactly one, because reading through the topic aggregates all of them:
/// WF-X-DEAL-01 has seven placements, so the topic-wide read returned 21 phases and 34 activities.
/// When no role is in scope there is still a right answer, so this resolves a deterministic default
/// rather than leaving the caller to aggregate.
/// </remarks>
internal static class HuddlePlacementLookup
{
    /// <summary>
    /// Role path first, then orientation, then additional content. Ordering on PathSection
    /// alphabetically would put SEC-ADDITIONAL first, which is the least representative section.
    /// </summary>
    private static IOrderedQueryable<HuddlePlacement> InPreferredOrder(IQueryable<HuddlePlacement> query) =>
        query
            .OrderBy(x => x.PathSection == "SEC-ROLEPATH" ? 0 : x.PathSection == "SEC-ORIENTATION" ? 1 : 2)
            .ThenBy(x => x.Sequence)
            .ThenBy(x => x.ExternalId);

    /// <summary>
    /// Counts the two tiers in SQL. Materialising placements and their activities as entities
    /// pulled every narrative column across the wire to produce two integers.
    /// </summary>
    private static readonly Expression<Func<HuddlePlacement, HuddlePlacementRow>> ToRow = x =>
        new HuddlePlacementRow(
            x.HuddleTopicId,
            x.ExternalId,
            x.Activities.Count(activity => activity.PracticeTier == HuddlePracticeTier.Featured),
            x.Activities.Count(activity => activity.PracticeTier == HuddlePracticeTier.Extended),
            x.RoleTopicName,
            x.RoleTopicDescription);

    /// <summary>The placement each topic offers this role, keyed by topic.</summary>
    public static async Task<IReadOnlyDictionary<int, HuddlePlacementSummary>> LoadForRoleAsync(
        IApplicationDbContext dbContext,
        string roleExternalId,
        CancellationToken cancellationToken)
    {
        List<HuddlePlacementRow> rows = await InPreferredOrder(dbContext.HuddlePlacements.AsNoTracking()
                .Where(x => x.HuddleSegmentRole.Role.ExternalId == roleExternalId && x.IsActive))
            .Select(ToRow)
            .ToListAsync(cancellationToken);

        return Group(rows);
    }

    /// <summary>
    /// The default placement for each topic, for a reader with no role in scope. Deterministic, so
    /// a card and the detail panel opened from it always name the same placement.
    /// </summary>
    public static async Task<IReadOnlyDictionary<int, HuddlePlacementSummary>> LoadDefaultsAsync(
        IApplicationDbContext dbContext,
        IReadOnlyCollection<int> topicIds,
        CancellationToken cancellationToken)
    {
        if (topicIds.Count == 0) return new Dictionary<int, HuddlePlacementSummary>();

        List<int> ids = topicIds.Distinct().ToList();
        List<HuddlePlacementRow> rows = await InPreferredOrder(dbContext.HuddlePlacements.AsNoTracking()
                .Where(x => ids.Contains(x.HuddleTopicId) && x.IsActive))
            .Select(ToRow)
            .ToListAsync(cancellationToken);

        return Group(rows);
    }

    /// <summary>
    /// Summaries for specific placements, keyed by placement id. Used when a saved plan names the
    /// placement a week should open, which a role path with a repeated topic requires.
    /// </summary>
    public static async Task<IReadOnlyDictionary<int, HuddlePlacementSummary>> LoadByIdsAsync(
        IApplicationDbContext dbContext,
        IReadOnlyCollection<int> placementIds,
        CancellationToken cancellationToken)
    {
        if (placementIds.Count == 0) return new Dictionary<int, HuddlePlacementSummary>();

        List<int> ids = placementIds.Distinct().ToList();
        var rows = await dbContext.HuddlePlacements.AsNoTracking()
            .Where(x => ids.Contains(x.Id))
            .Select(x => new
            {
                x.Id,
                x.ExternalId,
                Featured = x.Activities.Count(a => a.PracticeTier == HuddlePracticeTier.Featured),
                Extended = x.Activities.Count(a => a.PracticeTier == HuddlePracticeTier.Extended),
                x.RoleTopicName,
                x.RoleTopicDescription
            })
            .ToListAsync(cancellationToken);

        return rows.ToDictionary(
            row => row.Id,
            row => new HuddlePlacementSummary(
                row.ExternalId, row.Featured, row.Extended, row.RoleTopicName, row.RoleTopicDescription));
    }

    /// <summary>
    /// The identifier of one topic's default placement, or null when the topic has no placements at
    /// all, which is only true of pre-V4 seed rows.
    /// </summary>
    public static Task<string?> ResolveDefaultExternalIdAsync(
        IApplicationDbContext dbContext,
        int huddleTopicId,
        CancellationToken cancellationToken) =>
        InPreferredOrder(dbContext.HuddlePlacements.AsNoTracking()
                .Where(x => x.HuddleTopicId == huddleTopicId && x.IsActive))
            .Select(x => x.ExternalId)
            .FirstOrDefaultAsync(cancellationToken)!;

    /// <summary>
    /// The role's own placement where it has one, and the topic default everywhere else. A
    /// customised plan can hold a topic the role has no placement for, and that card still has to
    /// agree with the panel it opens.
    /// </summary>
    public static IReadOnlyDictionary<int, HuddlePlacementSummary> WithFallback(
        IReadOnlyDictionary<int, HuddlePlacementSummary>? preferred,
        IReadOnlyDictionary<int, HuddlePlacementSummary> fallback)
    {
        if (preferred is null || preferred.Count == 0) return fallback;

        Dictionary<int, HuddlePlacementSummary> merged = new(fallback);
        foreach (KeyValuePair<int, HuddlePlacementSummary> pair in preferred) merged[pair.Key] = pair.Value;
        return merged;
    }

    public static HuddlePlacementSummary? For(
        IReadOnlyDictionary<int, HuddlePlacementSummary>? placements, int topicId) =>
        placements is not null && placements.TryGetValue(topicId, out HuddlePlacementSummary? placement)
            ? placement
            : null;

    // The rows arrive ordered, so the first row for a topic is the one to open. A role can hold the
    // same topic twice, for example CSA-ARCH-1 and CSA-ARCH-2.
    private static Dictionary<int, HuddlePlacementSummary> Group(List<HuddlePlacementRow> rows) =>
        rows.GroupBy(x => x.HuddleTopicId)
            .ToDictionary(
                group => group.Key,
                group => new HuddlePlacementSummary(
                    group.First().ExternalId,
                    group.First().FeaturedActivityCount,
                    group.First().ExtendedActivityCount,
                    group.First().RoleTopicName,
                    group.First().RoleTopicDescription));
}
