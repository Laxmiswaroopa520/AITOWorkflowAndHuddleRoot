using FluentValidation;

namespace AitoWorkflowAndHuddleGenerator.Application.Features.Huddles.Coaching.Queries.GetAvailability;

public sealed class GetCoachAvailabilityQueryValidator : AbstractValidator<GetCoachAvailabilityQuery>
{
    public GetCoachAvailabilityQueryValidator()
    {
        RuleFor(x => x.CoachExternalId).NotEmpty().MaximumLength(100);
        RuleFor(x => x.DurationMinutes).Must(x => x is 30 or 60).WithMessage("Duration must be 30 or 60 minutes.");
        RuleFor(x => x.EndUtc).GreaterThan(x => x.StartUtc).Must((request, end) => end - request.StartUtc <= TimeSpan.FromDays(31));
    }
}
