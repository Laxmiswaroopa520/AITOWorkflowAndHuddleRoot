using FluentValidation;

namespace AitoWorkflowAndHuddleGenerator.Application.Features.Huddles.Catalog.Queries.GetRecommendedPath;

public sealed class GetRecommendedPathQueryValidator : AbstractValidator<GetRecommendedPathQuery>
{
    public GetRecommendedPathQueryValidator() => RuleFor(x => x.RoleExternalId).NotEmpty().MaximumLength(100);
}

