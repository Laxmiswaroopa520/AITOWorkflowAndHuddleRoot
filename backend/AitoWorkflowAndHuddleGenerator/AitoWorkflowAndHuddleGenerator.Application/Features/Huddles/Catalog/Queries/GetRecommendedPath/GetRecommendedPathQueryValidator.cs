using FluentValidation;

namespace AitoWorkflowAndHuddleGenerator.Application.Features.Huddles.Catalog.Queries.GetRecommendedPath;

/// <summary>
/// Validates Get Recommended Path Query requests.
/// </summary>
public sealed class GetRecommendedPathQueryValidator : AbstractValidator<GetRecommendedPathQuery>
{
    public GetRecommendedPathQueryValidator() => RuleFor(x => x.RoleExternalId).NotEmpty().MaximumLength(100);
}

