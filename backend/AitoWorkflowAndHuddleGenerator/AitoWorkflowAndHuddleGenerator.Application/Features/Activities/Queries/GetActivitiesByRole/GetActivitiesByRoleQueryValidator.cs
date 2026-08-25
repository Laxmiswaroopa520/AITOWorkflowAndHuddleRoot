using FluentValidation;

namespace AitoWorkflowAndHuddleGenerator
    .Application
    .Features
    .Activities
    .Queries
    .GetActivitiesByRole;

/// <summary>
/// Validates Get Activities By Role Query requests.
/// </summary>
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