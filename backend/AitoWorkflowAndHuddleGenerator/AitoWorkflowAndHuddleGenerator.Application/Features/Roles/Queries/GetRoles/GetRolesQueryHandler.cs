//Reads active roles from SQL and maps them to DTOs.
using AitoWorkflowAndHuddleGenerator
    .Application
    .Abstractions
    .Persistence;
using AitoWorkflowAndHuddleGenerator.Contracts.Roles;
using AitoWorkflowAndHuddleGenerator.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AitoWorkflowAndHuddleGenerator
    .Application
    .Features
    .Roles
    .Queries
    .GetRoles;

/// <summary>
/// Handles the Get Roles query.
/// </summary>
public sealed class GetRolesQueryHandler
    : IRequestHandler<
        GetRolesQuery,
        IReadOnlyList<RoleResponse>>
{
    private readonly IApplicationDbContext dbContext;

    public GetRolesQueryHandler(
        IApplicationDbContext dbContext)
    {
        this.dbContext = dbContext;
    }

    /// <summary>
    /// Handles the request through the application pipeline.
    /// </summary>

    public async Task<IReadOnlyList<RoleResponse>> Handle(
        GetRolesQuery request,
        CancellationToken cancellationToken)
    {
        IQueryable<Domain.Entities.Role> query =
            dbContext.Roles.AsNoTracking();

        if (!request.IncludeInactive)
        {
            query = query.Where(role => role.IsActive);
        }

        // dbo.Roles is shared by the Workflow Builder and Huddle modules; Huddle's own rows are
        // seeded with a "ROLE-" ExternalId prefix (see RoleModule's doc comment for why this
        // matters -- several role names have a row in both modules).
        if (request.Module == RoleModule.Huddle)
        {
            query = query.Where(role => role.ExternalId.StartsWith("ROLE-"));
        }
        else if (request.Module == RoleModule.Workflow)
        {
            query = query.Where(role => !role.ExternalId.StartsWith("ROLE-"));
        }

        return await query
            .OrderBy(role => role.SortOrder)
            .ThenBy(role => role.Name)
            .Select(role => new RoleResponse(
                role.Id,
                role.ExternalId,
                role.Name,
                role.Abbreviation,
                role.Segment,
                role.Description,
                role.SortOrder))
            .ToListAsync(cancellationToken);
    }
}