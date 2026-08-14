using AitoWorkflowAndHuddleGenerator.Contracts.Huddles;
using MediatR;

namespace AitoWorkflowAndHuddleGenerator.Application.Features.Huddles.Plans.Queries.GetMyHuddlePlan;

/// <summary>
/// Represents the Get My Huddle Plan Query query.
/// </summary>
public sealed record GetMyHuddlePlanQuery(string RoleExternalId) : IRequest<HuddlePlanResponse>;
