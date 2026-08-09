using AitoWorkflowAndHuddleGenerator
    .Contracts
    .Workflows;
using MediatR;

namespace AitoWorkflowAndHuddleGenerator
    .Application
    .Features
    .Workflows
    .Queries
    .GetFavoriteWorkflows;

public sealed record
    GetFavoriteWorkflowsQuery
    : IRequest<
        IReadOnlyCollection<
            WorkflowSummaryResponse>>;