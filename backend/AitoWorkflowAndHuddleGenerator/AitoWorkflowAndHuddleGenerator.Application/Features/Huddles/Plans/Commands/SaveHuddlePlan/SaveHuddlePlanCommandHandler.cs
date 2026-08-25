using AitoWorkflowAndHuddleGenerator.Application.Abstractions.Identity;
using AitoWorkflowAndHuddleGenerator.Application.Abstractions.Persistence;
using AitoWorkflowAndHuddleGenerator.Application.Common.Exceptions;
using AitoWorkflowAndHuddleGenerator.Application.Features.Huddles.Catalog.Common;
using AitoWorkflowAndHuddleGenerator.Application.Features.Huddles.Plans.Common;
using AitoWorkflowAndHuddleGenerator.Contracts.Huddles;
using AitoWorkflowAndHuddleGenerator.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AitoWorkflowAndHuddleGenerator.Application.Features.Huddles.Plans.Commands.SaveHuddlePlan;

/// <summary>
/// Handles the Save Huddle Plan command.
/// </summary>
public sealed class SaveHuddlePlanCommandHandler(
    IApplicationDbContext dbContext,
    ICurrentUserService currentUserService)
    : IRequestHandler<SaveHuddlePlanCommand, HuddlePlanResponse>
{
    /// <summary>
    /// Handles the request through the application pipeline.
    /// </summary>
    public async Task<HuddlePlanResponse> Handle(SaveHuddlePlanCommand request, CancellationToken cancellationToken)
    {
        string ownerObjectId = currentUserService.ObjectId
            ?? throw new UnauthorizedAccessException(AuthenticationMessages.MissingObjectIdClaim);
        string roleExternalId = request.RoleExternalId.Trim();

        HuddleSegmentRole segmentRole = await dbContext.HuddleSegmentRoles
            .Include(item => item.Role)
            .SingleOrDefaultAsync(item => item.Role.ExternalId == roleExternalId && item.Role.IsActive, cancellationToken)
            ?? throw new NotFoundException(HuddleMessages.ActiveRoleNotFound(roleExternalId));

        List<HuddleRolePathEntry> path = await HuddleRolePathReader.LoadWeeklyPathAsync(
            dbContext, roleExternalId, cancellationToken);
        // Saving a plan against a role that has no weekly path is a client error, not a data error.
        if (!HuddleRolePathReader.HasWeeklyPath(path))
            throw new ConflictException(HuddleMessages.RolePathNotConfigured(roleExternalId));
        if (!HuddleRolePathReader.IsContiguousFromWeekOne(path))
            throw new ConflictException(HuddleMessages.RolePathNotContiguous(roleExternalId, path.Count));
        if (request.Items.Count != path.Count)
            throw new ConflictException(HuddleMessages.PlanWeeksInvalid);

        // Topics named by the request.
        string[] requestedTopicIds = request.Items.Select(item => item.HuddleExternalId.Trim()).Distinct().ToArray();
        Dictionary<string, int> topicIdsByExternalId = await dbContext.HuddleTopics.AsNoTracking()
            .Where(topic => requestedTopicIds.Contains(topic.ExternalId) && topic.PublicationStatus == "Published")
            .Select(topic => new { topic.ExternalId, topic.Id })
            .ToDictionaryAsync(row => row.ExternalId, row => row.Id, StringComparer.OrdinalIgnoreCase, cancellationToken);
        if (request.Items.Any(item => !topicIdsByExternalId.ContainsKey(item.HuddleExternalId.Trim())))
            throw new NotFoundException(HuddleMessages.SelectedHuddlesUnavailable);

        // Placements named by the request, resolved against every placement of this role so a
        // customised week can move to another of that role's placements.
        Dictionary<string, int> placementIdsByExternalId = await dbContext.HuddlePlacements.AsNoTracking()
            .Where(item => item.IsActive && item.HuddleSegmentRole.Role.ExternalId == roleExternalId)
            .Select(item => new { item.ExternalId, item.Id })
            .ToDictionaryAsync(row => row.ExternalId, row => row.Id, StringComparer.OrdinalIgnoreCase, cancellationToken);
        Dictionary<int, int> recommendedPlacementIdByWeek = path.ToDictionary(entry => entry.Week, entry => entry.HuddlePlacementId);

        UserHuddlePlan? plan = await dbContext.UserHuddlePlans
            .Include(item => item.Items)
            .SingleOrDefaultAsync(item => item.OwnerObjectId == ownerObjectId && item.HuddleSegmentRoleId == segmentRole.Id, cancellationToken);

        if (plan is null)
        {
            if (!string.IsNullOrWhiteSpace(request.RowVersion))
                throw new ConflictException(HuddleMessages.PlanNoLongerExists);
            plan = new UserHuddlePlan
            {
                Id = Guid.NewGuid(),
                OwnerObjectId = ownerObjectId,
                HuddleSegmentRoleId = segmentRole.Id,
                Name = $"{segmentRole.DisplayName} Role Path",
                CreatedAtUtc = DateTimeOffset.UtcNow
            };
            dbContext.UserHuddlePlans.Add(plan);
        }
        else
        {
            if (string.IsNullOrWhiteSpace(request.RowVersion))
                throw new ConflictException(HuddleMessages.PlanChanged);
            dbContext.UserHuddlePlans.Entry(plan).Property(item => item.RowVersion).OriginalValue =
                Convert.FromBase64String(request.RowVersion);
            dbContext.UserHuddlePlanItems.RemoveRange(plan.Items);
        }

        foreach (SaveHuddlePlanItemRequest item in request.Items.OrderBy(item => item.Week))
        {
            int? placementId = ResolvePlacement(item, placementIdsByExternalId, recommendedPlacementIdByWeek);
            dbContext.UserHuddlePlanItems.Add(new UserHuddlePlanItem
            {
                UserHuddlePlanId = plan.Id,
                WeekPosition = item.Week,
                HuddleTopicId = topicIdsByExternalId[item.HuddleExternalId.Trim()],
                HuddlePlacementId = placementId
            });
        }

        try
        {
            await dbContext.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateConcurrencyException)
        {
            throw new ConflictException(HuddleMessages.PlanChangedByAnotherRequest);
        }
        catch (DbUpdateException)
        {
            throw new ConflictException(HuddleMessages.PlanAlreadyExists);
        }

        UserHuddlePlan savedPlan = await dbContext.UserHuddlePlans.AsNoTracking()
            .Include(item => item.Items)
            .SingleAsync(item => item.Id == plan.Id && item.OwnerObjectId == ownerObjectId, cancellationToken);

        List<UserHuddlePlanItem> saved = savedPlan.Items.OrderBy(item => item.WeekPosition).ToList();
        List<HuddleTopic> weekTopics = await HuddleTopicGraph.LoadCatalogGraphAsync(
            dbContext, saved.Select(item => item.HuddleTopicId).ToList(), cancellationToken);
        IReadOnlyDictionary<int, HuddlePlacementSummary> chosen = await HuddlePlacementLookup.LoadByIdsAsync(
            dbContext,
            saved.Where(item => item.HuddlePlacementId.HasValue).Select(item => item.HuddlePlacementId!.Value).ToList(),
            cancellationToken);
        Dictionary<int, HuddleRolePathEntry> recommendedByWeek = path.ToDictionary(entry => entry.Week);
        Dictionary<int, string> recommendedTopicExternalIds = await dbContext.HuddleTopics.AsNoTracking()
            .Where(topic => path.Select(entry => entry.HuddleTopicId).Contains(topic.Id))
            .Select(topic => new { topic.Id, topic.ExternalId })
            .ToDictionaryAsync(row => row.Id, row => row.ExternalId, cancellationToken);

        List<HuddlePlanWeek> weeks = [];
        for (int index = 0; index < saved.Count && index < weekTopics.Count; index++)
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
                : weekTopics[index].ExternalId;
            weeks.Add(new HuddlePlanWeek(
                item.WeekPosition, weekTopics[index], placement,
                recommendedTopicExternalId, recommended?.PlacementExternalId));
        }

        IReadOnlyDictionary<int, int> activityCounts = await HuddleActivityCounts.LoadAsync(
            dbContext, weekTopics.Select(item => item.Id).Distinct().ToList(), cancellationToken);
        return HuddlePlanMappings.ToResponse(roleExternalId, savedPlan.RowVersion, weeks, activityCounts);
    }

    /// <summary>
    /// The placement named by the request when it belongs to this role, otherwise the role path's
    /// own placement for that week. Rejects a placement that belongs to another role.
    /// </summary>
    private static int? ResolvePlacement(
        SaveHuddlePlanItemRequest item,
        Dictionary<string, int> placementIdsByExternalId,
        Dictionary<int, int> recommendedPlacementIdByWeek)
    {
        if (!string.IsNullOrWhiteSpace(item.PlacementExternalId))
        {
            return placementIdsByExternalId.TryGetValue(item.PlacementExternalId.Trim(), out int id)
                ? id
                : throw new NotFoundException(HuddleMessages.PlanPlacementUnknown);
        }

        return recommendedPlacementIdByWeek.TryGetValue(item.Week, out int fallback) ? fallback : null;
    }
}
