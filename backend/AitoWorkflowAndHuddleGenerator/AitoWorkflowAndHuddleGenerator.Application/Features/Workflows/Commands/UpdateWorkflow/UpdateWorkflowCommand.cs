using AitoWorkflowAndHuddleGenerator
    .Contracts
    .Workflows;
using MediatR;

namespace AitoWorkflowAndHuddleGenerator
    .Application
    .Features
    .Workflows
    .Commands
    .UpdateWorkflow;

public sealed record UpdateWorkflowCommand(
    Guid WorkflowId,
    string Name,
    string? Description,
    string RoleExternalId,
    IReadOnlyCollection<string>
        ActivityExternalIds,
    string RowVersion)
    : IRequest<WorkflowResponse>;