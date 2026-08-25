using AitoWorkflowAndHuddleGenerator.Application.Abstractions.Identity;
using AitoWorkflowAndHuddleGenerator.Application.Abstractions.Persistence;
using AitoWorkflowAndHuddleGenerator.Application.Common.Exceptions;
using AitoWorkflowAndHuddleGenerator.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AitoWorkflowAndHuddleGenerator.Application.Features.Huddles.LaunchPlans.Commands.ResetHuddleLaunchPlan;

/// <summary>Deletes only the current authenticated user's launch plan.</summary>
public sealed class ResetHuddleLaunchPlanCommandHandler(IApplicationDbContext dbContext, ICurrentUserService currentUserService) : IRequestHandler<ResetHuddleLaunchPlanCommand>
{
    /// <summary>Handles the reset command through the application pipeline.</summary>
    public async Task Handle(ResetHuddleLaunchPlanCommand request, CancellationToken cancellationToken)
    {
        string ownerObjectId = currentUserService.ObjectId ?? throw new UnauthorizedAccessException(AuthenticationMessages.MissingObjectIdClaim);
        UserHuddleLaunchPlan plan = await dbContext.UserHuddleLaunchPlans.SingleOrDefaultAsync(item => item.OwnerObjectId == ownerObjectId, cancellationToken)
            ?? throw new NotFoundException(HuddleMessages.LaunchPlanNotFound);
        dbContext.UserHuddleLaunchPlans.Remove(plan);
        await dbContext.SaveChangesAsync(cancellationToken);
    }
}
