using AitoWorkflowAndHuddleGenerator.Application.Abstractions.Identity;
using AitoWorkflowAndHuddleGenerator.Application.Abstractions.Persistence;
using AitoWorkflowAndHuddleGenerator.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AitoWorkflowAndHuddleGenerator.Application.Features.Huddles.Votes.Commands.RemoveHuddleVote;

public sealed class RemoveHuddleVoteCommandHandler(
    IApplicationDbContext dbContext,
    ICurrentUserService currentUserService) : IRequestHandler<RemoveHuddleVoteCommand>
{
    public async Task Handle(RemoveHuddleVoteCommand request, CancellationToken cancellationToken)
    {
        string ownerObjectId = currentUserService.ObjectId
            ?? throw new UnauthorizedAccessException("The authenticated token does not contain an oid claim.");
        HuddleVote? vote = await dbContext.HuddleVotes.SingleOrDefaultAsync(
            item => item.OwnerObjectId == ownerObjectId && item.HuddleTopic.ExternalId == request.HuddleExternalId,
            cancellationToken);
        if (vote is null) return;
        dbContext.HuddleVotes.Remove(vote);
        await dbContext.SaveChangesAsync(cancellationToken);
    }
}
