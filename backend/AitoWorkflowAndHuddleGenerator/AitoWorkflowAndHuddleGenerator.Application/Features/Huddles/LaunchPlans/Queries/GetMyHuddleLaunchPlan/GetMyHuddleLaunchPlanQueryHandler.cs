using AitoWorkflowAndHuddleGenerator.Application.Abstractions.Identity;
using AitoWorkflowAndHuddleGenerator.Application.Abstractions.Persistence;
using AitoWorkflowAndHuddleGenerator.Application.Features.Huddles.LaunchPlans.Common;
using AitoWorkflowAndHuddleGenerator.Contracts.Huddles;
using AitoWorkflowAndHuddleGenerator.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AitoWorkflowAndHuddleGenerator.Application.Features.Huddles.LaunchPlans.Queries.GetMyHuddleLaunchPlan;

/// <summary>Loads only the authenticated user's launch plan.</summary>
public sealed class GetMyHuddleLaunchPlanQueryHandler(IApplicationDbContext dbContext, ICurrentUserService currentUserService)
    : IRequestHandler<GetMyHuddleLaunchPlanQuery, HuddleLaunchPlanResponse?>
{
    /// <summary>Handles the query through the application pipeline.</summary>
    public async Task<HuddleLaunchPlanResponse?> Handle(GetMyHuddleLaunchPlanQuery request, CancellationToken cancellationToken)
    {
        string ownerObjectId = currentUserService.ObjectId
            ?? throw new UnauthorizedAccessException(AuthenticationMessages.MissingObjectIdClaim);
        UserHuddleLaunchPlan? plan = await dbContext.UserHuddleLaunchPlans.AsNoTracking()
            .SingleOrDefaultAsync(item => item.OwnerObjectId == ownerObjectId, cancellationToken);
        return plan is null ? null : HuddleLaunchPlanMappings.ToResponse(plan);
    }
}
