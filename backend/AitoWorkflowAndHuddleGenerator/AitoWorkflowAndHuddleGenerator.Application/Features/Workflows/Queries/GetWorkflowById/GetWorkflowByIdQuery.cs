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

public sealed record GetWorkflowByIdQuery(
    Guid WorkflowId)
    : IRequest<WorkflowResponse>;