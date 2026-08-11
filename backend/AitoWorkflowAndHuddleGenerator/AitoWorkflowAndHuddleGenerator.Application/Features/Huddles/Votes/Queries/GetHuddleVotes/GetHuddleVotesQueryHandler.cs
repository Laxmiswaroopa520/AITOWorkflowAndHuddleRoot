using AitoWorkflowAndHuddleGenerator.Application.Abstractions.Identity;
using AitoWorkflowAndHuddleGenerator.Application.Abstractions.Persistence;
using AitoWorkflowAndHuddleGenerator.Contracts.Huddles;
using AitoWorkflowAndHuddleGenerator.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AitoWorkflowAndHuddleGenerator.Application.Features.Huddles.Votes.Queries.GetHuddleVotes;

public sealed class GetHuddleVotesQueryHandler(
    IApplicationDbContext dbContext,
    ICurrentUserService currentUserService)
    : IRequestHandler<GetHuddleVotesQuery, IReadOnlyList<HuddleVoteResponse>>
{
    public async Task<IReadOnlyList<HuddleVoteResponse>> Handle(
        GetHuddleVotesQuery request,
        CancellationToken cancellationToken)
    {
        string ownerObjectId = currentUserService.ObjectId
            ?? throw new UnauthorizedAccessException("The authenticated token does not contain an oid claim.");

        return await dbContext.HuddleTopics
            .AsNoTracking()
            .Where(topic => topic.PublicationStatus == "Published")
            .Select(topic => new HuddleVoteResponse(
                topic.ExternalId,
                dbContext.HuddleVotes.Count(vote => vote.HuddleTopicId == topic.Id && vote.Value == HuddleVoteValue.Upvote),
                dbContext.HuddleVotes.Count(vote => vote.HuddleTopicId == topic.Id && vote.Value == HuddleVoteValue.Downvote),
                dbContext.HuddleVotes
                    .Where(vote => vote.HuddleTopicId == topic.Id && vote.OwnerObjectId == ownerObjectId)
                    .Select(vote => (int?)vote.Value)
                    .SingleOrDefault()))
            .ToListAsync(cancellationToken);
    }
}
