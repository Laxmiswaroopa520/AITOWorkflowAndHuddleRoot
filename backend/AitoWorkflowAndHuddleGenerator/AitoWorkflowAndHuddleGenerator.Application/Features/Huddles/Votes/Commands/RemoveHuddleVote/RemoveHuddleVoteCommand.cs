using MediatR;

namespace AitoWorkflowAndHuddleGenerator.Application.Features.Huddles.Votes.Commands.RemoveHuddleVote;

public sealed record RemoveHuddleVoteCommand(string HuddleExternalId) : IRequest;
