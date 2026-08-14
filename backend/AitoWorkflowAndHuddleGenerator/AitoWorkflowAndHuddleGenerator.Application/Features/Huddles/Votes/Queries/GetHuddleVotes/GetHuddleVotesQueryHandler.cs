using AitoWorkflowAndHuddleGenerator.Application.Abstractions.Identity;
using AitoWorkflowAndHuddleGenerator.Application.Abstractions.Persistence;
using AitoWorkflowAndHuddleGenerator.Contracts.Huddles;
using AitoWorkflowAndHuddleGenerator.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AitoWorkflowAndHuddleGenerator.Application.Features.Huddles.Votes.Queries.GetHuddleVotes;

/// <summary>
/// Handles the Get Huddle Votes query.
/// </summary>
public sealed class GetHuddleVotesQueryHandler(
    IApplicationDbContext dbContext,
    ICurrentUserService currentUserService)
    : IRequestHandler<GetHuddleVotesQuery, IReadOnlyList<HuddleVoteResponse>>
{
    /// <summary>
    /// Handles the request through the application pipeline.
    /// </summary>
    public async Task<IReadOnlyList<HuddleVoteResponse>> Handle(
        GetHuddleVotesQuery request,
        CancellationToken cancellationToken)
    {
        string ownerObjectId = currentUserService.ObjectId
            ?? throw new UnauthorizedAccessException(AuthenticationMessages.MissingObjectIdClaim);

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
