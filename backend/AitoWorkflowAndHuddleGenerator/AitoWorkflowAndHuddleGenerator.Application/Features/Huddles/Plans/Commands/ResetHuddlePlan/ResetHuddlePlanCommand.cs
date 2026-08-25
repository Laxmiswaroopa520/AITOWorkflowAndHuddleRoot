using MediatR;

namespace AitoWorkflowAndHuddleGenerator.Application.Features.Huddles.Plans.Commands.ResetHuddlePlan;

/// <summary>
/// Represents the Reset Huddle Plan Command command.
/// </summary>
public sealed record ResetHuddlePlanCommand(string RoleExternalId) : IRequest;
