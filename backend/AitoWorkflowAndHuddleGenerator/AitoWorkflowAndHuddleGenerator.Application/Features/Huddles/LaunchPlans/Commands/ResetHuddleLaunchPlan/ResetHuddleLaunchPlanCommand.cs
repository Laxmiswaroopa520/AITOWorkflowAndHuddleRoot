using MediatR;

namespace AitoWorkflowAndHuddleGenerator.Application.Features.Huddles.LaunchPlans.Commands.ResetHuddleLaunchPlan;

/// <summary>Deletes the authenticated user's launch plan.</summary>
public sealed record ResetHuddleLaunchPlanCommand : IRequest;
