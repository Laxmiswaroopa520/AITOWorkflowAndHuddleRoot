using AitoWorkflowAndHuddleGenerator
    .Application
    .Abstractions
    .Persistence;
using AitoWorkflowAndHuddleGenerator
    .Contracts
    .WorkflowBuckets;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AitoWorkflowAndHuddleGenerator
    .Application
    .Features
    .WorkflowBuckets
    .Queries
    .GetWorkflowBuckets;

/// <summary>
/// Handles the Get Workflow Buckets query.
/// </summary>
public sealed class GetWorkflowBucketsQueryHandler
    : IRequestHandler<
        GetWorkflowBucketsQuery,
        IReadOnlyList<WorkflowBucketResponse>>
{
    private readonly IApplicationDbContext dbContext;

    public GetWorkflowBucketsQueryHandler(
        IApplicationDbContext dbContext)
    {
        this.dbContext = dbContext;
    }

    public async Task<
        IReadOnlyList<WorkflowBucketResponse>> Handle(
            GetWorkflowBucketsQuery request,
            CancellationToken cancellationToken)
    {
        IQueryable<Domain.Entities.WorkflowBucket> query =
            dbContext.WorkflowBuckets.AsNoTracking();

        if (!request.IncludeInactive)
        {
            query = query.Where(bucket => bucket.IsActive);
        }

        return await query
            .OrderBy(bucket => bucket.SortOrder)
            .ThenBy(bucket => bucket.Name)
            .Select(bucket =>
                new WorkflowBucketResponse(
                    bucket.Id,
                    bucket.ExternalId,
                    bucket.Name,
                    bucket.Description,
                    bucket.SortOrder))
            .ToListAsync(cancellationToken);
    }
}