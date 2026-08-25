using AitoWorkflowAndHuddleGenerator.Contracts.Huddles;
using MediatR;

namespace AitoWorkflowAndHuddleGenerator.Application.Features.Huddles.Votes.Queries.GetHuddleVotes;

/// <summary>
/// Represents the Get Huddle Votes Query query.
/// </summary>
public sealed record GetHuddleVotesQuery : IRequest<IReadOnlyList<HuddleVoteResponse>>;
