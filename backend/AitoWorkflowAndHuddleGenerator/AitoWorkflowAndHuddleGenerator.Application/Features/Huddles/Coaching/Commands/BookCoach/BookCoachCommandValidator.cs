using FluentValidation;

namespace AitoWorkflowAndHuddleGenerator.Application.Features.Huddles.Coaching.Commands.BookCoach;

public sealed class BookCoachCommandValidator : AbstractValidator<BookCoachCommand>
{
    public BookCoachCommandValidator()
    {
        RuleFor(x => x.Request.CoachExternalId).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Request.HuddleExternalId).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Request.DisplayTimeZone).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Request.BookingRequestId).NotEmpty();
        RuleFor(x => x.Request.EndUtc).GreaterThan(x => x.Request.StartUtc);
        RuleFor(x => x.Request).Must(x => (x.EndUtc - x.StartUtc).TotalMinutes is 30 or 60).WithMessage("Booking duration must be 30 or 60 minutes.");
        RuleFor(x => x.Request.Question).MaximumLength(2000);
    }
}
