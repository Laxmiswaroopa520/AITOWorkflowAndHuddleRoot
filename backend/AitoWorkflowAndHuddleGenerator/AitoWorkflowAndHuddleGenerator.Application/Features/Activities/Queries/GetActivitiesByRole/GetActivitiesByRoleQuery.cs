using AitoWorkflowAndHuddleGenerator.Contracts.Activities;
using MediatR;

namespace AitoWorkflowAndHuddleGenerator
    .Application
    .Features
    .Activities
    .Queries
    .GetActivitiesByRole;

/// <summary>
/// Represents the Get Activities By Role Query query.
/// </summary>
public sealed record GetActivitiesByRoleQuery(
    string RoleExternalId)
    : IRequest<IReadOnlyList<ActivityResponse>>;