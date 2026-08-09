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

public sealed class GetActivityByIdQueryHandler
    : IRequestHandler<
        GetActivityByIdQuery,
        ActivityResponse?>
{
    private readonly IApplicationDbContext _dbContext;

    public GetActivityByIdQueryHandler(
        IApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<ActivityResponse?> Handle(
        GetActivityByIdQuery request,
        CancellationToken cancellationToken)
    {
        return await _dbContext.Activities
            .AsNoTracking()
            .Where(activity =>
                activity.Id == request.Id &&
                activity.IsActive)
            .Select(ActivityProjection.ToResponse)
            .SingleOrDefaultAsync(cancellationToken);
    }
}