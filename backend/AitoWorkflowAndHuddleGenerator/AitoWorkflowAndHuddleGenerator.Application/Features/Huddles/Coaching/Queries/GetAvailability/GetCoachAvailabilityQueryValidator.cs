using FluentValidation;

namespace AitoWorkflowAndHuddleGenerator.Application.Features.Huddles.Coaching.Queries.GetAvailability;

/// <summary>
/// Validates Get Coach Availability Query requests.
/// </summary>
public sealed class GetCoachAvailabilityQueryValidator : AbstractValidator<GetCoachAvailabilityQuery>
{
    public GetCoachAvailabilityQueryValidator()
    {
        RuleFor(x => x.CoachExternalId).NotEmpty().MaximumLength(100);
        RuleFor(x => x.DurationMinutes).Must(x => x is 30 or 60).WithMessage(CoachingMessages.InvalidDuration);
        RuleFor(x => x.EndUtc).GreaterThan(x => x.StartUtc).Must((request, end) => end - request.StartUtc <= TimeSpan.FromDays(31));
    }
}
