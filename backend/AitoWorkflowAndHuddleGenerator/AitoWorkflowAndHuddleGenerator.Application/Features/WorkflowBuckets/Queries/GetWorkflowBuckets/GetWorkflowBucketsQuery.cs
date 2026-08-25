using AitoWorkflowAndHuddleGenerator
    .Contracts
    .WorkflowBuckets;
using MediatR;

namespace AitoWorkflowAndHuddleGenerator
    .Application
    .Features
    .WorkflowBuckets
    .Queries
    .GetWorkflowBuckets;

/// <summary>
/// Represents the Get Workflow Buckets Query query.
/// </summary>
public sealed record GetWorkflowBucketsQuery(
    bool IncludeInactive = false)
    : IRequest<
        IReadOnlyList<WorkflowBucketResponse>>;