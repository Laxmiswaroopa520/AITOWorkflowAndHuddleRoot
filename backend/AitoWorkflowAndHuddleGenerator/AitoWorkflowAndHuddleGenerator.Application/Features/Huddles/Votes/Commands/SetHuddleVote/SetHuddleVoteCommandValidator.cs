using FluentValidation;

namespace AitoWorkflowAndHuddleGenerator.Application.Features.Huddles.Votes.Commands.SetHuddleVote;

/// <summary>
/// Validates Set Huddle Vote Command requests.
/// </summary>
public sealed class SetHuddleVoteCommandValidator : AbstractValidator<SetHuddleVoteCommand>
{
    public SetHuddleVoteCommandValidator()
    {
        RuleFor(command => command.HuddleExternalId).NotEmpty().MaximumLength(100);
        RuleFor(command => command.Value).Must(value => value is -1 or 1)
            .WithMessage(HuddleMessages.InvalidVote);
        RuleFor(command => command.Comment).MaximumLength(2000);
        RuleForEach(command => command.DownvoteReasons).NotEmpty().MaximumLength(200);
        RuleFor(command => command.DownvoteReasons)
            .Must(reasons => reasons is null || reasons.Count <= 10)
            .WithMessage(HuddleMessages.TooManyDownvoteReasons);
    }
}
