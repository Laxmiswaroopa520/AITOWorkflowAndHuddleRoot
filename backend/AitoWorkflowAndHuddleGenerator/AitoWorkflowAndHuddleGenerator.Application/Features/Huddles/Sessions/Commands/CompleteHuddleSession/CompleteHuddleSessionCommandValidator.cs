using FluentValidation;

namespace AitoWorkflowAndHuddleGenerator.Application.Features.Huddles.Sessions.Commands.CompleteHuddleSession;

public sealed class CompleteHuddleSessionCommandValidator : AbstractValidator<CompleteHuddleSessionCommand>
{
    public CompleteHuddleSessionCommandValidator()
    {
        RuleFor(request => request.HuddleExternalId).NotEmpty().MaximumLength(100);
        RuleFor(request => request.RowVersion).NotEmpty().Must(BeBase64).WithMessage("RowVersion must be a valid base64 value.");
    }
    private static bool BeBase64(string value) { try { Convert.FromBase64String(value); return true; } catch (FormatException) { return false; } }
}
