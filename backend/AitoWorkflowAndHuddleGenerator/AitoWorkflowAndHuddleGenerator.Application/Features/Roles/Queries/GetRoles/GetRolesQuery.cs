//Represents a request to load roles.
using AitoWorkflowAndHuddleGenerator.Contracts.Roles;
using MediatR;

namespace AitoWorkflowAndHuddleGenerator
    .Application
    .Features
    .Roles
    .Queries
    .GetRoles;

public sealed record GetRolesQuery(
    bool IncludeInactive = false)
    : IRequest<IReadOnlyList<RoleResponse>>;