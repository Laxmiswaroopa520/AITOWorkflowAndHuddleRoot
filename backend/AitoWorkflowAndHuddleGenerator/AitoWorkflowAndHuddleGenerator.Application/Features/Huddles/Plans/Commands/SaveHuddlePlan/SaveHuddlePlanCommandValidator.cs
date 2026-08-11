using FluentValidation;

namespace AitoWorkflowAndHuddleGenerator.Application.Features.Huddles.Plans.Commands.SaveHuddlePlan;

public sealed class SaveHuddlePlanCommandValidator : AbstractValidator<SaveHuddlePlanCommand>
{
    private static readonly int[] RequiredWeeks = [6, 7, 8, 9, 10, 11, 12];

    public SaveHuddlePlanCommandValidator()
    {
        RuleFor(command => command.RoleExternalId).NotEmpty().MaximumLength(100);
        RuleFor(command => command.RowVersion)
            .Must(value => string.IsNullOrWhiteSpace(value) || IsBase64(value))
            .WithMessage("RowVersion must be a valid Base64 value.");
        RuleFor(command => command.Items)
            .NotNull()
            .Must(items => items.Count == 7 && items.Select(item => item.Week).Order().SequenceEqual(RequiredWeeks))
            .WithMessage("The plan must contain exactly one item for each week from 6 through 12.")
            .Must(items => items.Select(item => item.HuddleExternalId).Distinct(StringComparer.OrdinalIgnoreCase).Count() == 7)
            .WithMessage("The plan must contain seven unique Huddles.");
        RuleForEach(command => command.Items).ChildRules(item =>
        {
            item.RuleFor(value => value.Week).InclusiveBetween(6, 12);
            item.RuleFor(value => value.HuddleExternalId).NotEmpty().MaximumLength(100);
        });
    }

    private static bool IsBase64(string value)
    {
        Span<byte> buffer = stackalloc byte[value.Length];
        return Convert.TryFromBase64String(value, buffer, out _);
    }
}
