using AitoWorkflowAndHuddleGenerator.Contracts.Huddles;
using FluentValidation;

namespace AitoWorkflowAndHuddleGenerator.Application.Features.Huddles.Plans.Commands.SaveHuddlePlan;

/// <summary>
/// Validates Save Huddle Plan Command requests.
/// </summary>
/// <remarks>
/// The week numbers are not hard-coded. The workbook defines a role path as a contiguous run of
/// weeks starting at 1, so this checks the shape of the submitted set and leaves the length and the
/// membership to the handler, which compares against that role's actual placements. The earlier
/// version required exactly weeks 2 to 8 and seven distinct topics, both of which the workbook
/// contradicts: a path starts at week 1 and a role revisits topics across weeks.
/// </remarks>
public sealed class SaveHuddlePlanCommandValidator : AbstractValidator<SaveHuddlePlanCommand>
{
    public SaveHuddlePlanCommandValidator()
    {
        RuleFor(command => command.RoleExternalId).NotEmpty().MaximumLength(100);
        RuleFor(command => command.RowVersion)
            .Must(value => string.IsNullOrWhiteSpace(value) || IsBase64(value))
            .WithMessage(ValidationMessages.InvalidRowVersion);
        RuleFor(command => command.Items)
            .NotNull()
            .Must(IsContiguousFromWeekOne)
            .WithMessage(HuddleMessages.PlanWeeksInvalid)
            .Must(HasDistinctPlacements)
            .WithMessage(HuddleMessages.PlanHuddlesMustBeUnique);
        RuleForEach(command => command.Items).ChildRules(item =>
        {
            item.RuleFor(value => value.Week).GreaterThanOrEqualTo(1);
            item.RuleFor(value => value.HuddleExternalId).NotEmpty().MaximumLength(100);
            item.RuleFor(value => value.PlacementExternalId).MaximumLength(100);
        });
    }

    private static bool IsContiguousFromWeekOne(IReadOnlyList<SaveHuddlePlanItemRequest> items) =>
        items.Count > 0
        && items.Select(item => item.Week).Order().SequenceEqual(Enumerable.Range(1, items.Count));

    /// <summary>
    /// Placements must be distinct, not topics. Two weeks legitimately share a topic; two weeks
    /// running the identical placement would be a duplicate.
    /// </summary>
    private static bool HasDistinctPlacements(IReadOnlyList<SaveHuddlePlanItemRequest> items)
    {
        string[] placements = items
            .Select(item => item.PlacementExternalId)
            .Where(value => !string.IsNullOrWhiteSpace(value))
            .Select(value => value!.Trim())
            .ToArray();

        return placements.Length == 0
            ? items.Select(item => item.HuddleExternalId).Distinct(StringComparer.OrdinalIgnoreCase).Count() == items.Count
            : placements.Distinct(StringComparer.OrdinalIgnoreCase).Count() == placements.Length;
    }

    private static bool IsBase64(string value)
    {
        Span<byte> buffer = stackalloc byte[value.Length];
        return Convert.TryFromBase64String(value, buffer, out _);
    }
}
