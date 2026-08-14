using AitoWorkflowAndHuddleGenerator
    .Application
    .Abstractions
    .Persistence;
using AitoWorkflowAndHuddleGenerator
    .Application
    .Features
    .Activities
    .Common;
using AitoWorkflowAndHuddleGenerator.Contracts.Activities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AitoWorkflowAndHuddleGenerator
    .Application
    .Features
    .Activities
    .Queries
    .GetActivitiesByRole;

/// <summary>
/// Handles the Get Activities By Role query.
/// </summary>
public sealed class GetActivitiesByRoleQueryHandler
    : IRequestHandler<
        GetActivitiesByRoleQuery,
        IReadOnlyList<ActivityResponse>>
{
    private readonly IApplicationDbContext dbContext;

    public GetActivitiesByRoleQueryHandler(
        IApplicationDbContext dbContext)
    {
        this.dbContext = dbContext;
    }

    public async Task<
        IReadOnlyList<ActivityResponse>> Handle(
            GetActivitiesByRoleQuery request,
            CancellationToken cancellationToken)
    {
        string roleExternalId =
            request.RoleExternalId.Trim();

        return await dbContext.Activities
            .AsNoTracking()
            .Where(activity =>
                activity.IsActive &&
                activity.Role.IsActive &&
                activity.Role.ExternalId ==
                    roleExternalId)
            .OrderBy(activity =>
                activity.WorkflowBucket.SortOrder)
            .ThenBy(activity => activity.SortOrder)
            .ThenBy(activity => activity.Title)
            .Select(ActivityProjection.ToResponse)
            .ToListAsync(cancellationToken);
    }
}