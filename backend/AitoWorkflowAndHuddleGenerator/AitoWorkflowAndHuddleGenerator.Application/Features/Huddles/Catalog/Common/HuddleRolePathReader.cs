using AitoWorkflowAndHuddleGenerator.Application.Abstractions.Persistence;
using AitoWorkflowAndHuddleGenerator.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace AitoWorkflowAndHuddleGenerator.Application.Features.Huddles.Catalog.Common;

/// <summary>
/// One entry on a role path: the placement, the week it occupies and the topic it presents.
/// </summary>
internal sealed record HuddleRolePathEntry(
    int HuddlePlacementId,
    string PlacementExternalId,
    int HuddleTopicId,
    int Week,
    string PathSection,
    string? RoleTopicName,
    string? RoleTopicDescription,
    int FeaturedActivityCount,
    int ExtendedActivityCount)
{
    public HuddlePlacementSummary ToSummary() => new(
        PlacementExternalId, FeaturedActivityCount, ExtendedActivityCount, RoleTopicName, RoleTopicDescription);
}

/// <summary>
/// Reads a role path from HuddlePlacements, which is where the workbook actually defines it.
/// </summary>
/// <remarks>
/// The workbook's Role_Paths sheet is a list of placements, not topics: each segment role has eight
/// rows with Sequence 1 to 8, where Sequence 1 is the orientation placement. No role path has eight
/// distinct topics, because a role revisits a topic in more than one week: ATS uses WF-X-CONV-01
/// three times and SE uses WF-X-ARCH-01 three times. Reading the path as a set of topics therefore
/// loses weeks, which is why the earlier HuddleRolePathItems read produced seven items numbered from
/// two. HuddleRolePathItems stores only the topic, so it cannot tell AE-PIPE-1 from AE-PIPE-2 and
/// cannot express the path at all.
/// </remarks>
internal static class HuddleRolePathReader
{
    public const string OrientationSection = "SEC-ORIENTATION";
    public const string RolePathSection = "SEC-ROLEPATH";
    public const string AdditionalSection = "SEC-ADDITIONAL";

    /// <summary>
    /// The weekly path for a role, ordered by week. Week is the placement's own Sequence, so W1 is
    /// the orientation placement and the numbering is never recomputed from a list index.
    /// </summary>
    public static Task<List<HuddleRolePathEntry>> LoadWeeklyPathAsync(
        IApplicationDbContext dbContext,
        string roleExternalId,
        CancellationToken cancellationToken) =>
        Query(dbContext)
            .Where(x => x.HuddleSegmentRole.Role.ExternalId == roleExternalId
                && (x.PathSection == OrientationSection || x.PathSection == RolePathSection))
            .OrderBy(x => x.Sequence).ThenBy(x => x.ExternalId)
            .Select(Projection)
            .ToListAsync(cancellationToken);

    /// <summary>
    /// The additional content a role is offered, from the workbook's Additional_Content sheet. This
    /// is what belongs under Additional Topics; the topic's aligned-roles list does not decide it.
    /// </summary>
    public static Task<List<HuddleRolePathEntry>> LoadAdditionalAsync(
        IApplicationDbContext dbContext,
        string? roleExternalId,
        CancellationToken cancellationToken)
    {
        IQueryable<Domain.Entities.HuddlePlacement> query = Query(dbContext)
            .Where(x => x.PathSection == AdditionalSection);

        if (!string.IsNullOrWhiteSpace(roleExternalId))
        {
            string role = roleExternalId.Trim();
            query = query.Where(x => x.HuddleSegmentRole.Role.ExternalId == role);
        }

        return query
            .OrderBy(x => x.Sequence).ThenBy(x => x.ExternalId)
            .Select(Projection)
            .ToListAsync(cancellationToken);
    }

    private static IQueryable<Domain.Entities.HuddlePlacement> Query(IApplicationDbContext dbContext) =>
        dbContext.HuddlePlacements.AsNoTracking().Where(x => x.IsActive);

    private static readonly System.Linq.Expressions.Expression<
        Func<Domain.Entities.HuddlePlacement, HuddleRolePathEntry>> Projection = x =>
        new HuddleRolePathEntry(
            x.Id,
            x.ExternalId,
            x.HuddleTopicId,
            x.Sequence,
            x.PathSection,
            x.RoleTopicName,
            x.RoleTopicDescription,
            x.Activities.Count(a => a.PracticeTier == HuddlePracticeTier.Featured),
            x.Activities.Count(a => a.PracticeTier == HuddlePracticeTier.Extended));

    /// <summary>
    /// A path is complete when its weeks are a contiguous run starting at one. The expected length
    /// comes from the data rather than a literal, so adding a ninth week needs no code change.
    /// </summary>
    /// <remarks>
    /// An empty path is NOT a broken path, and callers must tell the two apart. A role may offer a
    /// weekly path, additional content, or both: the workbook's ROLE-ALL has two Additional_Content
    /// rows and no Role_Paths rows at all, so it is an additional-content-only audience. Treating
    /// that as a misconfigured path produced a conflict the caller could not act on. Check
    /// <see cref="HasWeeklyPath"/> before asking whether the path is contiguous.
    /// </remarks>
    public static bool IsContiguousFromWeekOne(IReadOnlyList<HuddleRolePathEntry> path) =>
        path.Count > 0 && path.Select(x => x.Week).SequenceEqual(Enumerable.Range(1, path.Count));

    /// <summary>
    /// Whether this role offers a weekly path at all. False is a valid state, not an error.
    /// </summary>
    public static bool HasWeeklyPath(IReadOnlyList<HuddleRolePathEntry> path) => path.Count > 0;
}
