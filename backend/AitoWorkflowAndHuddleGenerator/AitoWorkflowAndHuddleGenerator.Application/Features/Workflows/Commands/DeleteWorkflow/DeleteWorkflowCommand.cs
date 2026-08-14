using MediatR;

namespace AitoWorkflowAndHuddleGenerator
    .Application
    .Features
    .Workflows
    .Commands
    .DeleteWorkflow;

/// <summary>
/// Represents the Delete Workflow Command command.
/// </summary>
public sealed record DeleteWorkflowCommand(
    Guid WorkflowId)
    : IRequest;