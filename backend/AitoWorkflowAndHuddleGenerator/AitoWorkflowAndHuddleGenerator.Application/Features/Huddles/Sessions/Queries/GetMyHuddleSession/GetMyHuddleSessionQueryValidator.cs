using FluentValidation;

namespace AitoWorkflowAndHuddleGenerator.Application.Features.Huddles.Sessions.Queries.GetMyHuddleSession;

/// <summary>
/// Validates Get My Huddle Session Query requests.
/// </summary>
public sealed class GetMyHuddleSessionQueryValidator : AbstractValidator<GetMyHuddleSessionQuery>
{
    public GetMyHuddleSessionQueryValidator() => RuleFor(request => request.HuddleExternalId).NotEmpty().MaximumLength(100);
}
