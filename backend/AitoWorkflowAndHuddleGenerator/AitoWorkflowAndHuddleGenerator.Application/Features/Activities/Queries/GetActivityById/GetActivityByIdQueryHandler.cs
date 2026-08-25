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
    .GetActivityById;

/// <summary>
/// Handles the Get Activity By Id query.
/// </summary>
public sealed class GetActivityByIdQueryHandler
    : IRequestHandler<
        GetActivityByIdQuery,
        ActivityResponse?>
{
    private readonly IApplicationDbContext dbContext;

    public GetActivityByIdQueryHandler(
        IApplicationDbContext dbContext)
    {
        this.dbContext = dbContext;
    }

    /// <summary>
    /// Handles the request through the application pipeline.
    /// </summary>

    public async Task<ActivityResponse?> Handle(
        GetActivityByIdQuery request,
        CancellationToken cancellationToken)
    {
        return await dbContext.Activities
            .AsNoTracking()
            .Where(activity =>
                activity.Id == request.Id &&
                activity.IsActive)
            .Select(ActivityProjection.ToResponse)
            .SingleOrDefaultAsync(cancellationToken);
    }
}