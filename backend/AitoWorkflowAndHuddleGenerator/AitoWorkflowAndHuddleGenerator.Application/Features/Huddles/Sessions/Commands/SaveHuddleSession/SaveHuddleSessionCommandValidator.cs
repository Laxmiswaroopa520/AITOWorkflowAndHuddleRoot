using FluentValidation;

namespace AitoWorkflowAndHuddleGenerator.Application.Features.Huddles.Sessions.Commands.SaveHuddleSession;

/// <summary>
/// Validates Save Huddle Session Command requests.
/// </summary>
public sealed class SaveHuddleSessionCommandValidator : AbstractValidator<SaveHuddleSessionCommand>
{
    public SaveHuddleSessionCommandValidator()
    {
        RuleFor(request => request.HuddleExternalId).NotEmpty().MaximumLength(100);
        RuleFor(request => request.CurrentPhaseExternalId).MaximumLength(100);
        RuleFor(request => request.FacilitatorNotes).MaximumLength(4000);
        RuleFor(request => request.RowVersion).Must(BeBase64).When(request => !string.IsNullOrWhiteSpace(request.RowVersion))
            .WithMessage(ValidationMessages.InvalidRowVersionLowercase);
    }

    private static bool BeBase64(string? value)
    {
        try { Convert.FromBase64String(value!); return true; }
        catch (FormatException) { return false; }
    }
}
