using FluentValidation;

namespace AitoWorkflowAndHuddleGenerator
    .Application
    .Features
    .Workflows
    .Commands
    .SaveWorkflow;

/// <summary>
/// Validates Save Workflow Command requests.
/// </summary>
public sealed class
    SaveWorkflowCommandValidator
    : AbstractValidator<
        SaveWorkflowCommand>
{
    public SaveWorkflowCommandValidator()
    {
        RuleFor(command => command.Name)
            .NotEmpty()
            .MaximumLength(200);

        RuleFor(
                command =>
                    command.Description)
            .MaximumLength(2000);

        RuleFor(
                command =>
                    command.RoleExternalId)
            .NotEmpty()
            .MaximumLength(50);

        RuleFor(
                command =>
                    command
                        .ActivityExternalIds)
            .NotEmpty()
            .Must(activityIds =>
                activityIds
                    .Where(id =>
                        !string
                            .IsNullOrWhiteSpace(
                                id))
                    .Distinct(
                        StringComparer
                            .OrdinalIgnoreCase)
                    .Any())
            .WithMessage(
                WorkflowMessages.ActivityRequired);

        RuleForEach(
                command =>
                    command
                        .ActivityExternalIds)
            .NotEmpty()
            .MaximumLength(150);
    }
}