using AitoWorkflowAndHuddleGenerator.Contracts.Huddles;
using MediatR;

namespace AitoWorkflowAndHuddleGenerator.Application.Features.Huddles.Votes.Commands.SetHuddleVote;

public sealed record SetHuddleVoteCommand(
    string HuddleExternalId,
    int Value,
    IReadOnlyList<string>? DownvoteReasons,
    string? Comment) : IRequest<HuddleVoteResponse>;
