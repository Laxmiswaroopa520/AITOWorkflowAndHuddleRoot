using MediatR;

namespace AitoWorkflowAndHuddleGenerator.Application.Features.Huddles.Votes.Commands.RemoveHuddleVote;

/// <summary>
/// Represents the Remove Huddle Vote Command command.
/// </summary>
public sealed record RemoveHuddleVoteCommand(string HuddleExternalId) : IRequest;
