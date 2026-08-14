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

/// <summary>
/// Represents the Get My Workflows Query query.
/// </summary>
public sealed record GetMyWorkflowsQuery(
    string? Search = null,
    bool? IsFavorite = null)
    : IRequest<
        IReadOnlyCollection<
            WorkflowSummaryResponse>>;