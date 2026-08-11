using FluentValidation;

namespace AitoWorkflowAndHuddleGenerator.Application.Features.Huddles.Votes.Commands.SetHuddleVote;

public sealed class SetHuddleVoteCommandValidator : AbstractValidator<SetHuddleVoteCommand>
{
    public SetHuddleVoteCommandValidator()
    {
        RuleFor(command => command.HuddleExternalId).NotEmpty().MaximumLength(100);
        RuleFor(command => command.Value).Must(value => value is -1 or 1)
            .WithMessage("Vote value must be -1 or 1.");
        RuleFor(command => command.Comment).MaximumLength(2000);
        RuleForEach(command => command.DownvoteReasons).NotEmpty().MaximumLength(200);
        RuleFor(command => command.DownvoteReasons)
            .Must(reasons => reasons is null || reasons.Count <= 10)
            .WithMessage("A maximum of 10 downvote reasons is allowed.");
    }
}
