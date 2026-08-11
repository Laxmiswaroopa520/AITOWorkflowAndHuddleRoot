using AitoWorkflowAndHuddleGenerator.Contracts.Huddles;
using MediatR;

namespace AitoWorkflowAndHuddleGenerator.Application.Features.Huddles.Votes.Queries.GetHuddleVotes;

public sealed record GetHuddleVotesQuery : IRequest<IReadOnlyList<HuddleVoteResponse>>;
