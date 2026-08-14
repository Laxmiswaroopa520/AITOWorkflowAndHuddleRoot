using FluentValidation;

namespace AitoWorkflowAndHuddleGenerator.Application.Features.Huddles.Sessions.Commands.CompleteHuddleSession;

/// <summary>
/// Validates Complete Huddle Session Command requests.
/// </summary>
public sealed class CompleteHuddleSessionCommandValidator : AbstractValidator<CompleteHuddleSessionCommand>
{
    public CompleteHuddleSessionCommandValidator()
    {
        RuleFor(request => request.HuddleExternalId).NotEmpty().MaximumLength(100);
        RuleFor(request => request.RowVersion).NotEmpty().Must(BeBase64).WithMessage(ValidationMessages.InvalidRowVersionLowercase);
    }
    private static bool BeBase64(string value) { try { Convert.FromBase64String(value); return true; } catch (FormatException) { return false; } }
}
