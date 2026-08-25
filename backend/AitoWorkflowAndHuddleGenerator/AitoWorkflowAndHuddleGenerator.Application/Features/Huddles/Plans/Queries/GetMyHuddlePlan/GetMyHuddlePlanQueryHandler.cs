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
public sealed class GetMyHuddlePlanQueryHandler(
    IApplicationDbContext dbContext,
    ICurrentUserService currentUserService)
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

        int segmentRoleId = await dbContext.HuddleSegmentRoles.AsNoTracking()
            .Where(item => item.Role.ExternalId == roleExternalId && item.Role.IsActive)
            .Select(item => (int?)item.Id)
            .SingleOrDefaultAsync(cancellationToken)
            ?? throw new NotFoundException(HuddleMessages.ActiveRoleNotFound(roleExternalId));

        List<HuddleRolePathEntry> path = await HuddleRolePathReader.LoadWeeklyPathAsync(
            dbContext, roleExternalId, cancellationToken);

        // A role can legitimately have no weekly path. The workbook's ROLE-ALL appears only in
        // Additional_Content, so it has additional Huddles but no Weeks 1 to 8. That is an empty
        // Role Path, not a broken one, and returning a conflict gave the caller an error it could
        // not act on. An empty plan lets the UI say so plainly.
        if (!HuddleRolePathReader.HasWeeklyPath(path))
            return HuddlePlanMappings.ToResponse(roleExternalId, null, [], new Dictionary<int, int>());

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

        List<HuddlePlanWeek> weeks = plan is null
            ? await RecommendedWeeks(path, cancellationToken)
            : await SavedWeeks(plan, path, cancellationToken);

        IReadOnlyDictionary<int, int> activityCounts = await HuddleActivityCounts.LoadAsync(
            dbContext, weeks.Select(week => week.Topic.Id).Distinct().ToList(), cancellationToken);

        return HuddlePlanMappings.ToResponse(roleExternalId, plan?.RowVersion, weeks, activityCounts);
    }

    private static bool CoversPath(ICollection<UserHuddlePlanItem> items, IReadOnlyList<HuddleRolePathEntry> path) =>
        items.Count == path.Count
        && items.Select(item => item.WeekPosition).Order().SequenceEqual(path.Select(entry => entry.Week));

    private async Task<List<HuddlePlanWeek>> RecommendedWeeks(
        IReadOnlyList<HuddleRolePathEntry> path, CancellationToken cancellationToken)
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
