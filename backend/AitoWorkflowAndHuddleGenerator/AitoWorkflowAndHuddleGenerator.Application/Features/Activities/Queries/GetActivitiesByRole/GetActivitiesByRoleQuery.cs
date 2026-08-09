using AitoWorkflowAndHuddleGenerator.Contracts.Activities;
using MediatR;

namespace AitoWorkflowAndHuddleGenerator
    .Application
    .Features
    .Activities
    .Queries
    .GetActivitiesByRole;

public sealed record GetActivitiesByRoleQuery(
    string RoleExternalId)
    : IRequest<IReadOnlyList<ActivityResponse>>;