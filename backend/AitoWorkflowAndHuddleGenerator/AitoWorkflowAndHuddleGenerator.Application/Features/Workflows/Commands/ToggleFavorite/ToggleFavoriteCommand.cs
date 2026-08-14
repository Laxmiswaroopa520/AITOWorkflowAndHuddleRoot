using AitoWorkflowAndHuddleGenerator
    .Contracts
    .Workflows;
using MediatR;

namespace AitoWorkflowAndHuddleGenerator
    .Application
    .Features
    .Workflows
    .Commands
    .ToggleFavorite;

/// <summary>
/// Represents the Toggle Favorite Command command.
/// </summary>
public sealed record ToggleFavoriteCommand(
    Guid WorkflowId,
    bool IsFavorite,
    string RowVersion)
    : IRequest<
        WorkflowSummaryResponse>;