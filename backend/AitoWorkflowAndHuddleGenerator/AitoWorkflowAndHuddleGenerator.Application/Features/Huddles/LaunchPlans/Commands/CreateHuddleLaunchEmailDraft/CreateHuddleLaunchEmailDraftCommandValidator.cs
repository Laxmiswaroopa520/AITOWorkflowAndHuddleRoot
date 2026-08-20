using FluentValidation;

namespace AitoWorkflowAndHuddleGenerator.Application.Features.Huddles.LaunchPlans.Commands.CreateHuddleLaunchEmailDraft;

/// <summary>Validates the launch email draft request.</summary>
public sealed class CreateHuddleLaunchEmailDraftCommandValidator
    : AbstractValidator<CreateHuddleLaunchEmailDraftCommand>
{
    /// <summary>Defines launch email draft validation rules.</summary>
    public CreateHuddleLaunchEmailDraftCommandValidator()
    {
        RuleFor(item => item.Subject).NotEmpty().MaximumLength(500);
        RuleFor(item => item.BodyText).NotEmpty().MaximumLength(20_000);
    }
}
