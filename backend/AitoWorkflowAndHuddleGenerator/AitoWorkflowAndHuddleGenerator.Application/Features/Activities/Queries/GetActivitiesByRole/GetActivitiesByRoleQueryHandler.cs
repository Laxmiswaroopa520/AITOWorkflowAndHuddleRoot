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

public sealed class GetActivitiesByRoleQueryHandler
    : IRequestHandler<
        GetActivitiesByRoleQuery,
        IReadOnlyList<ActivityResponse>>
{
    private readonly IApplicationDbContext _dbContext;

    public GetActivitiesByRoleQueryHandler(
        IApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<
        IReadOnlyList<ActivityResponse>> Handle(
            GetActivitiesByRoleQuery request,
            CancellationToken cancellationToken)
    {
        string roleExternalId =
            request.RoleExternalId.Trim();

        return await _dbContext.Activities
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