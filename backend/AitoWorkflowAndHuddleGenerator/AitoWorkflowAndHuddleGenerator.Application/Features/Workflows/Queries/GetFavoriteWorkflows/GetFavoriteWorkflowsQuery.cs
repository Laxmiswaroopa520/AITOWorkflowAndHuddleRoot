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

/// <summary>
/// Represents the Get Favorite Workflows Query query.
/// </summary>
public sealed record
    GetFavoriteWorkflowsQuery
    : IRequest<
        IReadOnlyCollection<
            WorkflowSummaryResponse>>;