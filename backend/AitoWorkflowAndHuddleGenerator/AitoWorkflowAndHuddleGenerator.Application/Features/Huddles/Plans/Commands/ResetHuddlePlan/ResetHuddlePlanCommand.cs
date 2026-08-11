using MediatR;

namespace AitoWorkflowAndHuddleGenerator.Application.Features.Huddles.Plans.Commands.ResetHuddlePlan;

public sealed record ResetHuddlePlanCommand(string RoleExternalId) : IRequest;
