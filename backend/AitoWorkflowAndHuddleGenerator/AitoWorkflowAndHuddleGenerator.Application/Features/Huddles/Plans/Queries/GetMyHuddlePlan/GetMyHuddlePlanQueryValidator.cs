using FluentValidation;

namespace AitoWorkflowAndHuddleGenerator.Application.Features.Huddles.Plans.Queries.GetMyHuddlePlan;

public sealed class GetMyHuddlePlanQueryValidator : AbstractValidator<GetMyHuddlePlanQuery>
{
    public GetMyHuddlePlanQueryValidator() =>
        RuleFor(query => query.RoleExternalId).NotEmpty().MaximumLength(100);
}
