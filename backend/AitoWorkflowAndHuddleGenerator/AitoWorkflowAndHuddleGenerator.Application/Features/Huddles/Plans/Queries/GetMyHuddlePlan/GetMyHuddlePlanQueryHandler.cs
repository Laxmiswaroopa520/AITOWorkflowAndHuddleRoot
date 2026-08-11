using AitoWorkflowAndHuddleGenerator.Application.Abstractions.Identity;
using AitoWorkflowAndHuddleGenerator.Application.Abstractions.Persistence;
using AitoWorkflowAndHuddleGenerator.Application.Common.Exceptions;
using AitoWorkflowAndHuddleGenerator.Application.Features.Huddles.Plans.Common;
using AitoWorkflowAndHuddleGenerator.Contracts.Huddles;
using AitoWorkflowAndHuddleGenerator.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AitoWorkflowAndHuddleGenerator.Application.Features.Huddles.Plans.Queries.GetMyHuddlePlan;

public sealed class GetMyHuddlePlanQueryHandler(
    IApplicationDbContext dbContext,
    ICurrentUserService currentUserService)
    : IRequestHandler<GetMyHuddlePlanQuery, HuddlePlanResponse>
{
    public async Task<HuddlePlanResponse> Handle(GetMyHuddlePlanQuery request, CancellationToken cancellationToken)
    {
        string ownerObjectId = currentUserService.ObjectId
            ?? throw new UnauthorizedAccessException("The authenticated token does not contain an oid claim.");
        string roleExternalId = request.RoleExternalId.Trim();

        HuddleSegmentRole segmentRole = await dbContext.HuddleSegmentRoles.AsNoTracking()
            .Include(item => item.Role)
            .SingleOrDefaultAsync(item => item.Role.ExternalId == roleExternalId && item.Role.IsActive, cancellationToken)
            ?? throw new NotFoundException($"Active role '{roleExternalId}' was not found.");

        List<HuddleTopic> recommended = await LoadRecommendedTopics(segmentRole.Id, cancellationToken);
        if (recommended.Count != 7)
            throw new ConflictException($"Role '{roleExternalId}' does not have exactly seven unique published recommended Huddles.");

        UserHuddlePlan? plan = await dbContext.UserHuddlePlans.AsNoTracking()
            .Include(item => item.Items).ThenInclude(item => item.HuddleTopic).ThenInclude(item => item.HuddleFocusArea)
            .Include(item => item.Items).ThenInclude(item => item.HuddleTopic).ThenInclude(item => item.TopicRoles).ThenInclude(item => item.Role)
            .Include(item => item.Items).ThenInclude(item => item.HuddleTopic).ThenInclude(item => item.TopicAgents).ThenInclude(item => item.HuddleAgent)
            .SingleOrDefaultAsync(item => item.OwnerObjectId == ownerObjectId && item.HuddleSegmentRoleId == segmentRole.Id, cancellationToken);

        if (plan is not null && (plan.Items.Count != 7 || plan.Items.Any(item => item.WeekPosition is < 6 or > 12)))
            throw new ConflictException("The saved Huddle plan is incomplete or invalid. Reset it to the recommended path.");

        return HuddlePlanMappings.ToResponse(roleExternalId, plan, recommended);
    }

    private async Task<List<HuddleTopic>> LoadRecommendedTopics(int segmentRoleId, CancellationToken cancellationToken) =>
        (await dbContext.HuddleRolePathItems.AsNoTracking()
            .Where(item => item.HuddleSegmentRoleId == segmentRoleId && item.HuddleTopic.PublicationStatus == "Published")
            .OrderBy(item => item.WeekPosition)
            .Include(item => item.HuddleTopic).ThenInclude(item => item.HuddleFocusArea)
            .Include(item => item.HuddleTopic).ThenInclude(item => item.TopicRoles).ThenInclude(item => item.Role)
            .Include(item => item.HuddleTopic).ThenInclude(item => item.TopicAgents).ThenInclude(item => item.HuddleAgent)
            .ToListAsync(cancellationToken))
        .GroupBy(item => item.HuddleTopicId).Select(group => group.First().HuddleTopic).Take(7).ToList();
}
