using AitoWorkflowAndHuddleGenerator.Application.Abstractions.Identity;
using AitoWorkflowAndHuddleGenerator.Application.Abstractions.Persistence;
using AitoWorkflowAndHuddleGenerator.Application.Common.Exceptions;
using AitoWorkflowAndHuddleGenerator.Application.Features.Huddles.Catalog.Common;
using AitoWorkflowAndHuddleGenerator.Application.Features.Huddles.Plans.Common;
using AitoWorkflowAndHuddleGenerator.Contracts.Huddles;
using AitoWorkflowAndHuddleGenerator.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AitoWorkflowAndHuddleGenerator.Application.Features.Huddles.Plans.Queries.GetMyHuddlePlan;

/// <summary>
/// Handles the Get My Huddle Plan query.
/// </summary>
/// <param name="rolePathCache">
/// Optional. When supplied (the application registers one), the role's governed path and its
/// recommended plan are served from memory; the user's own saved plan is always read fresh.
/// Without it every read goes to the database, exactly as before.
/// </param>
public sealed class GetMyHuddlePlanQueryHandler(
    IApplicationDbContext dbContext,
    ICurrentUserService currentUserService,
    RecommendedRolePathCache? rolePathCache = null)
    : IRequestHandler<GetMyHuddlePlanQuery, HuddlePlanResponse>
{
    /// <summary>
    /// Handles the request through the application pipeline.
    /// </summary>
    public async Task<HuddlePlanResponse> Handle(GetMyHuddlePlanQuery request, CancellationToken cancellationToken)
    {
        string ownerObjectId = currentUserService.ObjectId
            ?? throw new UnauthorizedAccessException(AuthenticationMessages.MissingObjectIdClaim);
        string roleExternalId = request.RoleExternalId.Trim();

        RolePathSnapshot snapshot = (rolePathCache is null
                ? await RecommendedRolePathCache.LoadRolePathAsync(dbContext, roleExternalId, cancellationToken)
                : await rolePathCache.GetRolePathAsync(dbContext, roleExternalId, cancellationToken))
            ?? throw new NotFoundException(HuddleMessages.ActiveRoleNotFound(roleExternalId));
        int segmentRoleId = snapshot.SegmentRoleId;
        IReadOnlyList<HuddleRolePathEntry> path = snapshot.Path;

        // A role can legitimately have no weekly path. The workbook's ROLE-ALL appears only in
        // Additional_Content, so it has additional Huddles but no Weeks 1 to 8. That is an empty
        // Role Path, not a broken one, and returning a conflict gave the caller an error it could
        // not act on. An empty plan lets the UI say so plainly.
        if (!HuddleRolePathReader.HasWeeklyPath(path))
            return HuddlePlanMappings.ToResponse(
                roleExternalId, null, [], new Dictionary<int, int>(),
                new Dictionary<int, IReadOnlyList<HuddleActivityAgent>>());

        if (!HuddleRolePathReader.IsContiguousFromWeekOne(path))
            throw new ConflictException(HuddleMessages.RolePathNotContiguous(roleExternalId, path.Count));

        UserHuddlePlan? plan = await dbContext.UserHuddlePlans.AsNoTracking()
            .Include(item => item.Items)
            .SingleOrDefaultAsync(
                item => item.OwnerObjectId == ownerObjectId && item.HuddleSegmentRoleId == segmentRoleId,
                cancellationToken);

        // A saved plan has to cover exactly the weeks the role path defines. Anything else is a plan
        // saved against an older path shape, and the caller is told to reset it.
        if (plan is not null && !CoversPath(plan.Items, path))
            throw new ConflictException(HuddleMessages.SavedPlanInvalid);

        // No saved plan: the response is the role's recommended plan, which holds nothing specific
        // to this user, so it can be shared. A saved plan below is always built fresh.
        if (plan is null)
            return rolePathCache is null
                ? await BuildRecommendedAsync(dbContext, roleExternalId, path, cancellationToken)
                : await rolePathCache.GetRecommendedAsync(roleExternalId,
                    () => BuildRecommendedAsync(dbContext, roleExternalId, path, cancellationToken));

        List<HuddlePlanWeek> weeks = await SavedWeeks(plan, path, cancellationToken);
        return await ToResponseAsync(dbContext, roleExternalId, plan.RowVersion, weeks, cancellationToken);
    }

    /// <summary>
    /// The recommended plan for a role's weekly path, as returned to a user with no saved plan.
    /// </summary>
    private static async Task<HuddlePlanResponse> BuildRecommendedAsync(
        IApplicationDbContext dbContext, string roleExternalId,
        IReadOnlyList<HuddleRolePathEntry> path, CancellationToken cancellationToken)
    {
        List<HuddlePlanWeek> weeks = await RecommendedWeeks(dbContext, path, cancellationToken);
        return await ToResponseAsync(dbContext, roleExternalId, null, weeks, cancellationToken);
    }

    private static async Task<HuddlePlanResponse> ToResponseAsync(
        IApplicationDbContext dbContext, string roleExternalId, byte[]? rowVersion,
        List<HuddlePlanWeek> weeks, CancellationToken cancellationToken)
    {
        IReadOnlyDictionary<int, int> activityCounts = await HuddleActivityCounts.LoadAsync(
            dbContext, weeks.Select(week => week.Topic.Id).Distinct().ToList(), cancellationToken);
        // Each week's Primary Agents come from its own placement's activities, not the topic's
        // shared TopicAgents (see HuddleMappings.ToPrimaryAgents).
        IReadOnlyDictionary<int, IReadOnlyList<HuddleActivityAgent>> placementPrimaryAgents =
            await HuddlePlacementActivityAgents.LoadPrimaryAsync(
                dbContext,
                weeks.Where(week => week.Placement is not null).Select(week => week.Placement!.Id).Distinct().ToList(),
                cancellationToken);

        return HuddlePlanMappings.ToResponse(
            roleExternalId, rowVersion, weeks, activityCounts, placementPrimaryAgents);
    }

    private static bool CoversPath(ICollection<UserHuddlePlanItem> items, IReadOnlyList<HuddleRolePathEntry> path) =>
        items.Count == path.Count
        && items.Select(item => item.WeekPosition).Order().SequenceEqual(path.Select(entry => entry.Week));

    private static async Task<List<HuddlePlanWeek>> RecommendedWeeks(
        IApplicationDbContext dbContext, IReadOnlyList<HuddleRolePathEntry> path, CancellationToken cancellationToken)
    {
        List<HuddleTopic> topics = await HuddleTopicGraph.LoadCatalogGraphAsync(
            dbContext, path.Select(entry => entry.HuddleTopicId).ToList(), cancellationToken);

        List<HuddlePlanWeek> weeks = [];
        for (int index = 0; index < path.Count && index < topics.Count; index++)
            weeks.Add(new HuddlePlanWeek(
                path[index].Week, topics[index], path[index].ToSummary(),
                topics[index].ExternalId, path[index].PlacementExternalId));
        return weeks;
    }

    private async Task<List<HuddlePlanWeek>> SavedWeeks(
        UserHuddlePlan plan, IReadOnlyList<HuddleRolePathEntry> path, CancellationToken cancellationToken)
    {
        List<UserHuddlePlanItem> saved = plan.Items.OrderBy(item => item.WeekPosition).ToList();
        List<HuddleTopic> topics = await HuddleTopicGraph.LoadCatalogGraphAsync(
            dbContext, saved.Select(item => item.HuddleTopicId).ToList(), cancellationToken);
        if (topics.Count != saved.Count) throw new ConflictException(HuddleMessages.SavedPlanInvalid);

        // The chosen placement per saved week, so a customised week shows that placement's own
        // activity counts and role title rather than another week's.
        int[] placementIds = saved.Where(item => item.HuddlePlacementId.HasValue)
            .Select(item => item.HuddlePlacementId!.Value).Distinct().ToArray();
        IReadOnlyDictionary<int, HuddlePlacementSummary> chosen = placementIds.Length == 0
            ? new Dictionary<int, HuddlePlacementSummary>()
            : await HuddlePlacementLookup.LoadByIdsAsync(dbContext, placementIds, cancellationToken);

        Dictionary<int, HuddleRolePathEntry> recommendedByWeek = path.ToDictionary(entry => entry.Week);

        // The recommended topic identifiers come from the path, not from the saved rows, because a
        // customised week points at a different topic than the one recommended for it.
        int[] recommendedTopicIds = path.Select(entry => entry.HuddleTopicId).Distinct().ToArray();
        Dictionary<int, string> recommendedTopicExternalIds = await dbContext.HuddleTopics.AsNoTracking()
            .Where(topic => recommendedTopicIds.Contains(topic.Id))
            .Select(topic => new { topic.Id, topic.ExternalId })
            .ToDictionaryAsync(row => row.Id, row => row.ExternalId, cancellationToken);

        List<HuddlePlanWeek> weeks = [];
        for (int index = 0; index < saved.Count; index++)
        {
            UserHuddlePlanItem item = saved[index];
            recommendedByWeek.TryGetValue(item.WeekPosition, out HuddleRolePathEntry? recommended);
            HuddlePlacementSummary? placement = item.HuddlePlacementId.HasValue
                && chosen.TryGetValue(item.HuddlePlacementId.Value, out HuddlePlacementSummary? summary)
                ? summary
                : recommended?.ToSummary();
            string recommendedTopicExternalId = recommended is not null
                && recommendedTopicExternalIds.TryGetValue(recommended.HuddleTopicId, out string? external)
                ? external
                : topics[index].ExternalId;
            weeks.Add(new HuddlePlanWeek(
                item.WeekPosition, topics[index], placement,
                recommendedTopicExternalId, recommended?.PlacementExternalId));
        }
        return weeks;
    }
}
