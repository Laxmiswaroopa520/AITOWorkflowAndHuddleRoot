using AitoWorkflowAndHuddleGenerator
    .Contracts
    .Workflows;
using MediatR;

namespace AitoWorkflowAndHuddleGenerator
    .Application
    .Features
    .Workflows
    .Queries
    .GetWorkflowById;

/// <summary>
/// Represents the Get Workflow By Id Query query.
/// </summary>
public sealed record GetWorkflowByIdQuery(
    Guid WorkflowId)
    : IRequest<WorkflowResponse>;