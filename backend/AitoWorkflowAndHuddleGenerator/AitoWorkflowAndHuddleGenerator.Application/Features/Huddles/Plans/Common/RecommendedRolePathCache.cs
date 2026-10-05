using AitoWorkflowAndHuddleGenerator.Application.Abstractions.Persistence;
using AitoWorkflowAndHuddleGenerator.Application.Features.Huddles.Catalog.Common;
using AitoWorkflowAndHuddleGenerator.Application.Features.Huddles.Plans.Queries.GetMyHuddlePlan;
using AitoWorkflowAndHuddleGenerator.Contracts.Huddles;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;

namespace AitoWorkflowAndHuddleGenerator.Application.Features.Huddles.Plans.Common;

/// <summary>
/// A role's segment-role id and weekly path, as read from the governed placements.
/// <paramref name="RoleExternalId"/> is the role id exactly as stored, which may differ in case
/// from the id the caller supplied because the database compares ids case-insensitively.
/// </summary>
internal sealed record RolePathSnapshot(int SegmentRoleId, string RoleExternalId, IReadOnlyList<HuddleRolePathEntry> Path)
{
    /// <summary>
    /// True when the caller used the stored spelling. Only that spelling is cached, so the cache
    /// holds at most one entry per role no matter how many case variants are requested.
    /// </summary>
    public bool IsStoredSpelling(string requestedRoleExternalId) =>
        string.Equals(RoleExternalId, requestedRoleExternalId, StringComparison.Ordinal);
}

/// <summary>
/// Keeps the governed Role Path content in memory for a short time, so a Role Path read does not
/// repeat the same content queries for every user and every request.
/// </summary>
/// <remarks>
/// Only governed content is cached: a role's weekly path and the recommended plan that follows
/// from it. That content comes from the workbook seed scripts and no code path writes it, so the
/// only way it goes stale is a reseed, and entries expire after <see cref="Lifetime"/>. A user's own
/// saved plan is never cached: <see cref="GetMyHuddlePlanQueryHandler"/> still reads
/// UserHuddlePlans on every request and builds a saved plan fresh.
/// </remarks>
public sealed class RecommendedRolePathCache(IMemoryCache cache)
{
    /// <summary>How long cached Role Path content is kept before it is read again.</summary>
    public static readonly TimeSpan Lifetime = TimeSpan.FromMinutes(10);

    private static string PathKey(string roleExternalId) => $"huddle-role-path:path:{roleExternalId}";

    private static string RecommendedKey(string roleExternalId) => $"huddle-role-path:recommended:{roleExternalId}";

    /// <summary>
    /// The role's segment-role id and weekly path, or null when the role is unknown or inactive.
    /// An unknown role is not cached, so a role added by a reseed is found on the next request.
    /// Only the stored spelling of the role id is cached; other spellings (e.g. "role-ae") still
    /// resolve, but are read from the database each time, which keeps the cache bounded.
    /// </summary>
    internal async Task<RolePathSnapshot?> GetRolePathAsync(
        IApplicationDbContext dbContext, string roleExternalId, CancellationToken cancellationToken)
    {
        if (cache.TryGetValue(PathKey(roleExternalId), out RolePathSnapshot? cached)) return cached;

        RolePathSnapshot? snapshot = await LoadRolePathAsync(dbContext, roleExternalId, cancellationToken);
        if (snapshot is not null && snapshot.IsStoredSpelling(roleExternalId))
            cache.Set(PathKey(roleExternalId), snapshot, Lifetime);
        return snapshot;
    }

    /// <summary>
    /// The recommended plan for a role, built once by <paramref name="build"/> and then reused.
    /// Only for callers that have confirmed the user has no saved plan for this role. As with the
    /// path, it is cached only when the caller used the stored spelling of the role id; the response
    /// echoes the requested id, so other spellings are always built fresh and returned unchanged.
    /// </summary>
    internal async Task<HuddlePlanResponse> GetRecommendedAsync(
        RolePathSnapshot snapshot, string roleExternalId, Func<Task<HuddlePlanResponse>> build)
    {
        if (!snapshot.IsStoredSpelling(roleExternalId)) return await build();

        if (cache.TryGetValue(RecommendedKey(roleExternalId), out HuddlePlanResponse? cached) && cached is not null)
            return cached;

        HuddlePlanResponse response = await build();
        cache.Set(RecommendedKey(roleExternalId), response, Lifetime);
        return response;
    }

    /// <summary>The uncached read, shared by the cache and by callers that run without one.</summary>
    internal static async Task<RolePathSnapshot?> LoadRolePathAsync(
        IApplicationDbContext dbContext, string roleExternalId, CancellationToken cancellationToken)
    {
        var segmentRole = await dbContext.HuddleSegmentRoles.AsNoTracking()
            .Where(item => item.Role.ExternalId == roleExternalId && item.Role.IsActive)
            .Select(item => new { item.Id, item.Role.ExternalId })
            .SingleOrDefaultAsync(cancellationToken);
        if (segmentRole is null) return null;

        List<HuddleRolePathEntry> path = await HuddleRolePathReader.LoadWeeklyPathAsync(
            dbContext, roleExternalId, cancellationToken);
        return new RolePathSnapshot(segmentRole.Id, segmentRole.ExternalId, path);
    }
}
