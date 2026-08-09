using AitoWorkflowAndHuddleGenerator
    .Contracts
    .Workflows;
using MediatR;

namespace AitoWorkflowAndHuddleGenerator
    .Application
    .Features
    .Workflows
    .Queries
    .GetMyWorkflows;

public sealed record GetMyWorkflowsQuery(
    string? Search = null,
    bool? IsFavorite = null)
    : IRequest<
        IReadOnlyCollection<
            WorkflowSummaryResponse>>;