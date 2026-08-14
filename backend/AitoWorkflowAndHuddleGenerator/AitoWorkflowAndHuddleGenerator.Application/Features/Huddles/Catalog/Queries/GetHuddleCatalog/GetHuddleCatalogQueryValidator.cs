using FluentValidation;

namespace AitoWorkflowAndHuddleGenerator.Application.Features.Huddles.Catalog.Queries.GetHuddleCatalog;

/// <summary>
/// Validates Get Huddle Catalog Query requests.
/// </summary>
public sealed class GetHuddleCatalogQueryValidator : AbstractValidator<GetHuddleCatalogQuery>
{
    private static readonly string[] SortValues = ["default", "name", "priority", "most-upvoted", "role-relevance"];

    public GetHuddleCatalogQueryValidator()
    {
        RuleFor(x => x.RoleExternalId).MaximumLength(100);
        RuleFor(x => x.FocusAreaExternalId).MaximumLength(100);
        RuleFor(x => x.AgentExternalId).MaximumLength(100);
        RuleFor(x => x.Type).MaximumLength(50);
        RuleFor(x => x.Search).MaximumLength(250);
        RuleFor(x => x.Sort)
            .Must(value => string.IsNullOrWhiteSpace(value) || SortValues.Contains(value.Trim(), StringComparer.OrdinalIgnoreCase))
            .WithMessage(HuddleMessages.InvalidCatalogSort);
    }
}

