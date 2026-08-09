using FluentValidation;

namespace AitoWorkflowAndHuddleGenerator
    .Application
    .Features
    .Activities
    .Queries
    .GetActivitiesByRole;

public sealed class GetActivitiesByRoleQueryValidator
    : AbstractValidator<GetActivitiesByRoleQuery>
{
    public GetActivitiesByRoleQueryValidator()
    {
        RuleFor(query => query.RoleExternalId)
            .NotEmpty()
            .MaximumLength(100);
    }
}