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

public sealed record ToggleFavoriteCommand(
    Guid WorkflowId,
    bool IsFavorite,
    string RowVersion)
    : IRequest<
        WorkflowSummaryResponse>;