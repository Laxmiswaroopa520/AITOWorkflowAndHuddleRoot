using AitoWorkflowAndHuddleGenerator
    .Api
    .Authorization;
using AitoWorkflowAndHuddleGenerator
    .Application
    .Features
    .WorkflowBuckets
    .Queries
    .GetWorkflowBuckets;
using AitoWorkflowAndHuddleGenerator
    .Contracts
    .WorkflowBuckets;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AitoWorkflowAndHuddleGenerator
    .Api
    .Controllers;

[ApiController]
[Route("api/workflow-buckets")]
[Authorize(Policy = Policies.AccessAsUser)]
public sealed class WorkflowBucketsController
    : ControllerBase
{
    private readonly ISender _sender;

    public WorkflowBucketsController(
        ISender sender)
    {
        _sender = sender;
    }

    [HttpGet]
    [ProducesResponseType(
        typeof(
            IReadOnlyList<WorkflowBucketResponse>),
        StatusCodes.Status200OK)]
    [ProducesResponseType(
        StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(
        StatusCodes.Status403Forbidden)]
    public async Task< ActionResult< IReadOnlyList<WorkflowBucketResponse>>>
        GetWorkflowBuckets(
            [FromQuery] bool includeInactive,
            CancellationToken cancellationToken)
    {
        IReadOnlyList<WorkflowBucketResponse> response =
            await _sender.Send(
                new GetWorkflowBucketsQuery(
                    includeInactive),
                cancellationToken);

        return Ok(response);
    }
}