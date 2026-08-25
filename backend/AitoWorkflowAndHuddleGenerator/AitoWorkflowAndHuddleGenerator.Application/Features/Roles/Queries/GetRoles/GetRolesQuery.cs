//Represents a request to load roles.
using AitoWorkflowAndHuddleGenerator.Contracts.Roles;
using MediatR;

namespace AitoWorkflowAndHuddleGenerator
    .Application
    .Features
    .Roles
    .Queries
    .GetRoles;

/// <summary>
/// Represents the Get Roles Query query.
/// </summary>
public sealed record GetRolesQuery(
    bool IncludeInactive = false)
    : IRequest<IReadOnlyList<RoleResponse>>;