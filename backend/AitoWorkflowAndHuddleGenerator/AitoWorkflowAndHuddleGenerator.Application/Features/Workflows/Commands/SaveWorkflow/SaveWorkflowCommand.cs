using AitoWorkflowAndHuddleGenerator
    .Contracts
    .Workflows;
using MediatR;

namespace AitoWorkflowAndHuddleGenerator
    .Application
    .Features
    .Workflows
    .Commands
    .SaveWorkflow;

/// <summary>
/// Represents the Save Workflow Command command.
/// </summary>
public sealed record SaveWorkflowCommand(
    string Name,
    string? Description,
    string RoleExternalId,
    IReadOnlyCollection<string>
        ActivityExternalIds)
    : IRequest<WorkflowResponse>;