using AitoWorkflowAndHuddleGenerator.Api.Authorization;
using AitoWorkflowAndHuddleGenerator.Application.Features.WorkflowBuckets.Queries.GetWorkflowBuckets;
using AitoWorkflowAndHuddleGenerator.Contracts.WorkflowBuckets;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AitoWorkflowAndHuddleGenerator.Api.Controllers;

[ApiController]
[Route("api/workflow-buckets")]
[Authorize(Policy = Policies.AccessAsUser)]
/// <summary>
/// Provides authenticated access to workflow bucket definitions.
/// </summary>
public sealed class WorkflowBucketsController
    : ControllerBase
{
    private readonly ISender sender;

    /// <summary>
    /// Initializes a new instance of the <see cref="WorkflowBucketsController"/> class.
    /// </summary>
    /// <param name="sender">The mediator used to dispatch workflow bucket queries.</param>
    public WorkflowBucketsController(
        ISender sender)
    {
        this.sender = sender;
    }

    /// <summary>
    /// Gets workflow buckets, optionally including inactive entries.
    /// </summary>
    /// <param name="includeInactive">Whether inactive workflow buckets should be included.</param>
    /// <param name="cancellationToken">A token used to cancel the request.</param>
    /// <returns>The workflow bucket catalog.</returns>
    [HttpGet]
    [ProducesResponseType(
        typeof(
            IReadOnlyList<WorkflowBucketResponse>),
        StatusCodes.Status200OK)]
    [ProducesResponseType(
        StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(
        StatusCodes.Status403Forbidden)]
    /// <summary>
    /// Gets Workflow Buckets.
    /// </summary>
    public async Task< ActionResult< IReadOnlyList<WorkflowBucketResponse>>>
        GetWorkflowBuckets(
            [FromQuery] bool includeInactive,
            CancellationToken cancellationToken)
    {
        IReadOnlyList<WorkflowBucketResponse> response =
            await sender.Send(
                new GetWorkflowBucketsQuery(
                    includeInactive),
                cancellationToken);

        return Ok(response);
    }
}
