using FluentValidation;

namespace AitoWorkflowAndHuddleGenerator.Application.Features.Huddles.Votes.Commands.RemoveHuddleVote;

/// <summary>
/// Validates Remove Huddle Vote Command requests.
/// </summary>
public sealed class RemoveHuddleVoteCommandValidator : AbstractValidator<RemoveHuddleVoteCommand>
{
    public RemoveHuddleVoteCommandValidator() =>
        RuleFor(command => command.HuddleExternalId).NotEmpty().MaximumLength(100);
}
