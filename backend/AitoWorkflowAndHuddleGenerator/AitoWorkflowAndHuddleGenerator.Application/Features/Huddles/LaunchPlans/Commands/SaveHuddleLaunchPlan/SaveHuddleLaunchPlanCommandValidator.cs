using FluentValidation;
using System.Text.Json;

namespace AitoWorkflowAndHuddleGenerator.Application.Features.Huddles.LaunchPlans.Commands.SaveHuddleLaunchPlan;

/// <summary>Validates launch configuration and serialized milestone state.</summary>
public sealed class SaveHuddleLaunchPlanCommandValidator : AbstractValidator<SaveHuddleLaunchPlanCommand>
{
    /// <summary>Defines launch-plan validation rules.</summary>
    public SaveHuddleLaunchPlanCommandValidator()
    {
        RuleFor(item => item.TeamName).NotEmpty().MaximumLength(200);
        RuleFor(item => item.CohortName).NotEmpty().MaximumLength(200);
        RuleFor(item => item.SponsorName).NotEmpty().MaximumLength(200);
        RuleFor(item => item.Managers).MaximumLength(2000);
        RuleFor(item => item.Facilitators).MaximumLength(2000);
        RuleFor(item => item.ProgramLead).NotEmpty().MaximumLength(200);
        RuleFor(item => item.EndDate).GreaterThanOrEqualTo(item => item.StartDate).When(item => item.EndDate.HasValue);
        RuleFor(item => item.TaskStateJson).NotEmpty().MaximumLength(100_000).Must(BeJson).WithMessage("Task state must be valid JSON.");
    }

    private static bool BeJson(string value)
    {
        try { using JsonDocument document = JsonDocument.Parse(value); return document.RootElement.ValueKind == JsonValueKind.Object; }
        catch (JsonException) { return false; }
    }
}
