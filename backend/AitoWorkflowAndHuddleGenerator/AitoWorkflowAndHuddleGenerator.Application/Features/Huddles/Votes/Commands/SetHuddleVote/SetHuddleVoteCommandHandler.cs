using System.Text.Json;
using AitoWorkflowAndHuddleGenerator.Application.Abstractions.Identity;
using AitoWorkflowAndHuddleGenerator.Application.Abstractions.Persistence;
using AitoWorkflowAndHuddleGenerator.Application.Common.Exceptions;
using AitoWorkflowAndHuddleGenerator.Contracts.Huddles;
using AitoWorkflowAndHuddleGenerator.Domain.Entities;
using AitoWorkflowAndHuddleGenerator.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AitoWorkflowAndHuddleGenerator.Application.Features.Huddles.Votes.Commands.SetHuddleVote;

/// <summary>
/// Handles the Set Huddle Vote command.
/// </summary>
public sealed class SetHuddleVoteCommandHandler(
    IApplicationDbContext dbContext,
    ICurrentUserService currentUserService)
    : IRequestHandler<SetHuddleVoteCommand, HuddleVoteResponse>
{
    /// <summary>
    /// Handles the request through the application pipeline.
    /// </summary>
    public async Task<HuddleVoteResponse> Handle(
        SetHuddleVoteCommand request,
        CancellationToken cancellationToken)
    {
        string ownerObjectId = currentUserService.ObjectId
            ?? throw new UnauthorizedAccessException(AuthenticationMessages.MissingObjectIdClaim);

        HuddleTopic topic = await dbContext.HuddleTopics.SingleOrDefaultAsync(
            item => item.ExternalId == request.HuddleExternalId && item.PublicationStatus == "Published",
            cancellationToken)
            ?? throw new NotFoundException(HuddleMessages.NotFound);

        HuddleVote? vote = await dbContext.HuddleVotes.SingleOrDefaultAsync(
            item => item.OwnerObjectId == ownerObjectId && item.HuddleTopicId == topic.Id,
            cancellationToken);

        if (vote is null)
        {
            vote = new HuddleVote
            {
                Id = Guid.NewGuid(),
                OwnerObjectId = ownerObjectId,
                HuddleTopicId = topic.Id,
                CreatedAtUtc = DateTime.UtcNow
            };
            dbContext.HuddleVotes.Add(vote);
        }

        vote.Value = (HuddleVoteValue)request.Value;
        vote.DownvoteReasons = request.Value == -1 && request.DownvoteReasons is { Count: > 0 }
            ? JsonSerializer.Serialize(request.DownvoteReasons)
            : null;
        vote.Comment = request.Value == -1 ? request.Comment?.Trim() : null;

        await dbContext.SaveChangesAsync(cancellationToken);
        return await BuildResponse(topic, ownerObjectId, cancellationToken);
    }

    private async Task<HuddleVoteResponse> BuildResponse(
        HuddleTopic topic,
        string ownerObjectId,
        CancellationToken cancellationToken)
    {
        int upvotes = await dbContext.HuddleVotes.CountAsync(
            vote => vote.HuddleTopicId == topic.Id && vote.Value == HuddleVoteValue.Upvote,
            cancellationToken);
        int downvotes = await dbContext.HuddleVotes.CountAsync(
            vote => vote.HuddleTopicId == topic.Id && vote.Value == HuddleVoteValue.Downvote,
            cancellationToken);
        int? currentVote = await dbContext.HuddleVotes
            .Where(vote => vote.HuddleTopicId == topic.Id && vote.OwnerObjectId == ownerObjectId)
            .Select(vote => (int?)vote.Value)
            .SingleOrDefaultAsync(cancellationToken);

        return new HuddleVoteResponse(topic.ExternalId, upvotes, downvotes, currentVote);
    }
}
