using AitoWorkflowAndHuddleGenerator.Contracts.Huddles;
using MediatR;

namespace AitoWorkflowAndHuddleGenerator.Application.Features.Huddles.LaunchPlans.Queries.GetMyHuddleLaunchPlan;

/// <summary>Requests the authenticated user's launch plan.</summary>
public sealed record GetMyHuddleLaunchPlanQuery : IRequest<HuddleLaunchPlanResponse?>;
