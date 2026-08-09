using MediatR;

namespace AitoWorkflowAndHuddleGenerator
    .Application
    .Features
    .Workflows
    .Commands
    .DeleteWorkflow;

public sealed record DeleteWorkflowCommand(
    Guid WorkflowId)
    : IRequest;