using AitoWorkflowAndHuddleGenerator.Application.Abstractions.Identity;
using AitoWorkflowAndHuddleGenerator.Application.Abstractions.Persistence;
using AitoWorkflowAndHuddleGenerator.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AitoWorkflowAndHuddleGenerator.Application.Features.Huddles.Votes.Commands.RemoveHuddleVote;

/// <summary>
/// Handles the Remove Huddle Vote command.
/// </summary>
public sealed class RemoveHuddleVoteCommandHandler(
    IApplicationDbContext dbContext,
    ICurrentUserService currentUserService) : IRequestHandler<RemoveHuddleVoteCommand>
{
    /// <summary>
    /// Handles the request through the application pipeline.
    /// </summary>
    public async Task Handle(RemoveHuddleVoteCommand request, CancellationToken cancellationToken)
    {
        string ownerObjectId = currentUserService.ObjectId
            ?? throw new UnauthorizedAccessException(AuthenticationMessages.MissingObjectIdClaim);
        HuddleVote? vote = await dbContext.HuddleVotes.SingleOrDefaultAsync(
            item => item.OwnerObjectId == ownerObjectId && item.HuddleTopic.ExternalId == request.HuddleExternalId,
            cancellationToken);
        if (vote is null) return;
        dbContext.HuddleVotes.Remove(vote);
        await dbContext.SaveChangesAsync(cancellationToken);
    }
}
