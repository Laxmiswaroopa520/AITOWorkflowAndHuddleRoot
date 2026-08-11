using AitoWorkflowAndHuddleGenerator.Application.Abstractions.Identity;
using AitoWorkflowAndHuddleGenerator.Application.Abstractions.Persistence;
using AitoWorkflowAndHuddleGenerator.Application.Common.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AitoWorkflowAndHuddleGenerator.Application.Features.Huddles.Plans.Commands.ResetHuddlePlan;

public sealed class ResetHuddlePlanCommandHandler(
    IApplicationDbContext dbContext,
    ICurrentUserService currentUserService) : IRequestHandler<ResetHuddlePlanCommand>
{
    public async Task Handle(ResetHuddlePlanCommand request, CancellationToken cancellationToken)
    {
        string ownerObjectId = currentUserService.ObjectId
            ?? throw new UnauthorizedAccessException("The authenticated token does not contain an oid claim.");
        string roleExternalId = request.RoleExternalId.Trim();

        int segmentRoleId = await dbContext.HuddleSegmentRoles.AsNoTracking()
            .Where(item => item.Role.ExternalId == roleExternalId && item.Role.IsActive)
            .Select(item => item.Id)
            .SingleOrDefaultAsync(cancellationToken);
        if (segmentRoleId == 0)
            throw new NotFoundException($"Active role '{roleExternalId}' was not found.");

        var plan = await dbContext.UserHuddlePlans
            .SingleOrDefaultAsync(item => item.OwnerObjectId == ownerObjectId &&
                                          item.HuddleSegmentRoleId == segmentRoleId, cancellationToken);
        if (plan is null)
            return;

        dbContext.UserHuddlePlans.Remove(plan);
        try
        {
            await dbContext.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateConcurrencyException)
        {
            throw new ConflictException("This Huddle plan was changed by another request. Refresh and try again.");
        }
    }
}
