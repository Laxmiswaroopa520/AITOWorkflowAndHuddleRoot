using FluentValidation;

namespace AitoWorkflowAndHuddleGenerator
    .Application
    .Features
    .Activities
    .Queries
    .GetActivityById;

/// <summary>
/// Validates Get Activity By Id Query requests.
/// </summary>
public sealed class GetActivityByIdQueryValidator
    : AbstractValidator<GetActivityByIdQuery>
{
    public GetActivityByIdQueryValidator()
    {
        RuleFor(query => query.Id)
            .GreaterThan(0);
    }
}