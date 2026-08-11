using AitoWorkflowAndHuddleGenerator.Contracts.Huddles;
using MediatR;

namespace AitoWorkflowAndHuddleGenerator.Application.Features.Huddles.Plans.Queries.GetMyHuddlePlan;

public sealed record GetMyHuddlePlanQuery(string RoleExternalId) : IRequest<HuddlePlanResponse>;
