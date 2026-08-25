using FluentValidation;

namespace AitoWorkflowAndHuddleGenerator.Application.Features.Huddles.Plans.Queries.GetMyHuddlePlan;

/// <summary>
/// Validates Get My Huddle Plan Query requests.
/// </summary>
public sealed class GetMyHuddlePlanQueryValidator : AbstractValidator<GetMyHuddlePlanQuery>
{
    public GetMyHuddlePlanQueryValidator() =>
        RuleFor(query => query.RoleExternalId).NotEmpty().MaximumLength(100);
}
