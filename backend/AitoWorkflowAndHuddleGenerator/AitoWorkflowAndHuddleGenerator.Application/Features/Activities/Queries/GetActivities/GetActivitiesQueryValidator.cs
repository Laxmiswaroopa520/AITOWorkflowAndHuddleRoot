using AitoWorkflowAndHuddleGenerator.Domain.Enums;
using FluentValidation;

namespace AitoWorkflowAndHuddleGenerator
    .Application
    .Features
    .Activities
    .Queries
    .GetActivities;

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
                "Category contains an unsupported value.");

        RuleFor(query => query.Frequency)
            .Must(BeValidEnum<ActivityFrequency>)
            .When(query =>
                !string.IsNullOrWhiteSpace(
                    query.Frequency))
            .WithMessage(
                "Frequency contains an unsupported value.");

        RuleFor(query => query.Priority)
            .Must(BeValidEnum<ActivityPriority>)
            .When(query =>
                !string.IsNullOrWhiteSpace(
                    query.Priority))
            .WithMessage(
                "Priority contains an unsupported value.");

        RuleFor(query => query.ToolCoverageLevel)
            .Must(BeValidEnum<ToolCoverageLevel>)
            .When(query =>
                !string.IsNullOrWhiteSpace(
                    query.ToolCoverageLevel))
            .WithMessage(
                "ToolCoverageLevel contains an unsupported value.");

        RuleFor(query => query.TriggerContext)
            .Must(BeValidEnum<TriggerContext>)
            .When(query =>
                !string.IsNullOrWhiteSpace(
                    query.TriggerContext))
            .WithMessage(
                "TriggerContext contains an unsupported value.");

        RuleFor(query => query.McemStage)
            .Must(BeValidEnum<McemStage>)
            .When(query =>
                !string.IsNullOrWhiteSpace(
                    query.McemStage))
            .WithMessage(
                "McemStage contains an unsupported value.");
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