using FluentValidation;

namespace AitoWorkflowAndHuddleGenerator.Application.Features.Huddles.Catalog.Queries.GetHuddleById;

/// <summary>
/// Validates Get Huddle By Id Query requests.
/// </summary>
public sealed class GetHuddleByIdQueryValidator : AbstractValidator<GetHuddleByIdQuery>
{
    public GetHuddleByIdQueryValidator() => RuleFor(x => x.ExternalId).NotEmpty().MaximumLength(100);
}

