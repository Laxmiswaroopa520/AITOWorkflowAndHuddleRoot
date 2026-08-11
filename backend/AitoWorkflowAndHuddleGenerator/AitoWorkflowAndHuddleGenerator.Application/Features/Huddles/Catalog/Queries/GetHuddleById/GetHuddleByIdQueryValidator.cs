using FluentValidation;

namespace AitoWorkflowAndHuddleGenerator.Application.Features.Huddles.Catalog.Queries.GetHuddleById;

public sealed class GetHuddleByIdQueryValidator : AbstractValidator<GetHuddleByIdQuery>
{
    public GetHuddleByIdQueryValidator() => RuleFor(x => x.ExternalId).NotEmpty().MaximumLength(100);
}

