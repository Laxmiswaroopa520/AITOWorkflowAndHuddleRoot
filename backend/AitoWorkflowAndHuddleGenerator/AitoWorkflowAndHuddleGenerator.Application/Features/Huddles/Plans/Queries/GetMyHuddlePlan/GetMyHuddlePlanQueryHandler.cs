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

        HuddleSegmentRole segmentRole = await dbContext.HuddleSegmentRoles.AsNoTracking()
            .Include(item => item.Role)
            .SingleOrDefaultAsync(item => item.Role.ExternalId == roleExternalId && item.Role.IsActive, cancellationToken)
            ?? throw new NotFoundException(HuddleMessages.ActiveRoleNotFound(roleExternalId));

        List<HuddleTopic> recommended = await LoadRecommendedTopics(segmentRole.Id, cancellationToken);
        if (recommended.Count != 7)
            throw new ConflictException(HuddleMessages.RecommendedPathIncomplete(roleExternalId));

        UserHuddlePlan? plan = await dbContext.UserHuddlePlans.AsNoTracking()
            .Include(item => item.Items).ThenInclude(item => item.HuddleTopic).ThenInclude(item => item.HuddleFocusArea)
            .Include(item => item.Items).ThenInclude(item => item.HuddleTopic).ThenInclude(item => item.TopicRoles).ThenInclude(item => item.Role)
            .Include(item => item.Items).ThenInclude(item => item.HuddleTopic).ThenInclude(item => item.TopicAgents).ThenInclude(item => item.HuddleAgent)
            .Include(item => item.Items).ThenInclude(item => item.HuddleTopic).ThenInclude(item => item.McemStages).ThenInclude(item => item.HuddleMcemStage)
            .SingleOrDefaultAsync(item => item.OwnerObjectId == ownerObjectId && item.HuddleSegmentRoleId == segmentRole.Id, cancellationToken);

        if (plan is not null && (plan.Items.Count != 7 || !HasSupportedWeekRange(plan.Items)))
            throw new ConflictException(HuddleMessages.SavedPlanInvalid);

        IReadOnlyDictionary<int, int> activityCounts = await HuddleActivityCounts.LoadAsync(
            dbContext,
            recommended.Select(item => item.Id)
                .Concat(plan?.Items.Select(item => item.HuddleTopicId) ?? Array.Empty<int>())
                .Distinct().ToList(),
            cancellationToken);
        return HuddlePlanMappings.ToResponse(roleExternalId, plan, recommended, activityCounts);
    }

    private async Task<List<HuddleTopic>> LoadRecommendedTopics(int segmentRoleId, CancellationToken cancellationToken) =>
        (await dbContext.HuddleRolePathItems.AsNoTracking()
            .Where(item => item.HuddleSegmentRoleId == segmentRoleId && item.HuddleTopic.PublicationStatus == "Published")
            .OrderBy(item => item.WeekPosition)
            .Include(item => item.HuddleTopic).ThenInclude(item => item.HuddleFocusArea)
            .Include(item => item.HuddleTopic).ThenInclude(item => item.TopicRoles).ThenInclude(item => item.Role)
            .Include(item => item.HuddleTopic).ThenInclude(item => item.TopicAgents).ThenInclude(item => item.HuddleAgent)
            .Include(item => item.HuddleTopic).ThenInclude(item => item.McemStages).ThenInclude(item => item.HuddleMcemStage)
            .ToListAsync(cancellationToken))
        .GroupBy(item => item.HuddleTopicId).Select(group => group.First().HuddleTopic).Take(7).ToList();

    private static bool HasSupportedWeekRange(IEnumerable<UserHuddlePlanItem> items)
    {
        int[] weeks = items.Select(item => item.WeekPosition).Order().ToArray();
        return weeks.SequenceEqual([2, 3, 4, 5, 6, 7, 8])
            || weeks.SequenceEqual([6, 7, 8, 9, 10, 11, 12]);
    }
}
