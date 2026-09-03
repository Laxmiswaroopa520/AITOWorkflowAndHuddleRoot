//Represents a request to load roles.
using AitoWorkflowAndHuddleGenerator.Contracts.Roles;
using AitoWorkflowAndHuddleGenerator.Domain.Enums;
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
/// <param name="IncludeInactive">Whether inactive roles should be included.</param>
/// <param name="Module">
/// Restricts the result to one module's roles (see <see cref="RoleModule"/>). Leave null to get
/// every role regardless of which module owns it -- the existing behavior the Workflow Builder
/// screens still rely on.
/// </param>
public sealed record GetRolesQuery(
    bool IncludeInactive = false,
    RoleModule? Module = null)
    : IRequest<IReadOnlyList<RoleResponse>>;