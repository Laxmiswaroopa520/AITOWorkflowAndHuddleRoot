using FluentValidation;

namespace AitoWorkflowAndHuddleGenerator.Application.Features.Huddles.Plans.Commands.ResetHuddlePlan;

public sealed class ResetHuddlePlanCommandValidator : AbstractValidator<ResetHuddlePlanCommand>
{
    public ResetHuddlePlanCommandValidator() =>
        RuleFor(request => request.RoleExternalId).NotEmpty().MaximumLength(100);
}
