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

public sealed record GetWorkflowBucketsQuery(
    bool IncludeInactive = false)
    : IRequest<
        IReadOnlyList<WorkflowBucketResponse>>;