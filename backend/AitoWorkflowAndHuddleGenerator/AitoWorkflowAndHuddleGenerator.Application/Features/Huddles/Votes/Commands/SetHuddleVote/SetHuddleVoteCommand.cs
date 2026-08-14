using AitoWorkflowAndHuddleGenerator.Contracts.Huddles;
using MediatR;

namespace AitoWorkflowAndHuddleGenerator.Application.Features.Huddles.Votes.Commands.SetHuddleVote;

/// <summary>
/// Represents the Set Huddle Vote Command command.
/// </summary>
public sealed record SetHuddleVoteCommand(
    string HuddleExternalId,
    int Value,
    IReadOnlyList<string>? DownvoteReasons,
    string? Comment) : IRequest<HuddleVoteResponse>;
