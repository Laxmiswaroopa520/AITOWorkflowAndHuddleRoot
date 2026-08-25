using AitoWorkflowAndHuddleGenerator.Domain.Enums;
using FluentValidation;

namespace AitoWorkflowAndHuddleGenerator
    .Application
    .Features
    .Activities
    .Queries
    .GetActivities;

/// <summary>
/// Validates Get Activities Query requests.
/// </summary>
public sealed class GetActivitiesQueryValidator
    : AbstractValidator<GetActivitiesQuery>
{
    public GetActivitiesQueryValidator()
    {
        RuleFor(query => query.RoleId)
            .MaximumLength(100);

        RuleFor(query => query.WorkflowBucketId)
            .MaximumLength(100);

        RuleFor(query => query.AiToolId)
            .MaximumLength(100);

        RuleFor(query => query.Search)
            .MaximumLength(250);

        RuleFor(query => query.Category)
            .Must(BeValidEnum<ActivityCategory>)
            .When(query =>
                !string.IsNullOrWhiteSpace(
                    query.Category))
            .WithMessage(
                ActivityValidationMessages.UnsupportedCategory);

        RuleFor(query => query.Frequency)
            .Must(BeValidEnum<ActivityFrequency>)
            .When(query =>
                !string.IsNullOrWhiteSpace(
                    query.Frequency))
            .WithMessage(
                ActivityValidationMessages.UnsupportedFrequency);

        RuleFor(query => query.Priority)
            .Must(BeValidEnum<ActivityPriority>)
            .When(query =>
                !string.IsNullOrWhiteSpace(
                    query.Priority))
            .WithMessage(
                ActivityValidationMessages.UnsupportedPriority);

        RuleFor(query => query.ToolCoverageLevel)
            .Must(BeValidEnum<ToolCoverageLevel>)
            .When(query =>
                !string.IsNullOrWhiteSpace(
                    query.ToolCoverageLevel))
            .WithMessage(
                ActivityValidationMessages.UnsupportedToolCoverageLevel);

        RuleFor(query => query.TriggerContext)
            .Must(BeValidEnum<TriggerContext>)
            .When(query =>
                !string.IsNullOrWhiteSpace(
                    query.TriggerContext))
            .WithMessage(
                ActivityValidationMessages.UnsupportedTriggerContext);

        RuleFor(query => query.McemStage)
            .Must(BeValidEnum<McemStage>)
            .When(query =>
                !string.IsNullOrWhiteSpace(
                    query.McemStage))
            .WithMessage(
                ActivityValidationMessages.UnsupportedMcemStage);
    }

    private static bool BeValidEnum<TEnum>(
        string? value)
        where TEnum : struct, Enum
    {
        return string.IsNullOrWhiteSpace(value) ||
            Enum.TryParse<TEnum>(
                value,
                ignoreCase: true,
                out _);
    }
}