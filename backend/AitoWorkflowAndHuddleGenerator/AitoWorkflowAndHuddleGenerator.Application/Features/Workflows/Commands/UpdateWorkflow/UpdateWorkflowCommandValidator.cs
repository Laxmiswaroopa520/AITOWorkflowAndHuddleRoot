using FluentValidation;

namespace AitoWorkflowAndHuddleGenerator
    .Application
    .Features
    .Workflows
    .Commands
    .UpdateWorkflow;

public sealed class
    UpdateWorkflowCommandValidator
    : AbstractValidator<
        UpdateWorkflowCommand>
{
    public UpdateWorkflowCommandValidator()
    {
        RuleFor(
                command =>
                    command.WorkflowId)
            .NotEmpty();

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
            .NotEmpty();

        RuleForEach(
                command =>
                    command
                        .ActivityExternalIds)
            .NotEmpty()
            .MaximumLength(150);

        RuleFor(
                command =>
                    command.RowVersion)
            .NotEmpty()
            .Must(BeValidBase64)
            .WithMessage(
                "RowVersion must be a valid Base64 value.");
    }

    private static bool BeValidBase64(
        string value)
    {
        try
        {
            Convert.FromBase64String(
                value);

            return true;
        }
        catch (FormatException)
        {
            return false;
        }
    }
}