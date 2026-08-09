using AitoWorkflowAndHuddleGenerator
    .Api
    .Authorization;
using AitoWorkflowAndHuddleGenerator
    .Application
    .Features
    .Workflows
    .Commands
    .DeleteWorkflow;
using AitoWorkflowAndHuddleGenerator
    .Application
    .Features
    .Workflows
    .Commands
    .SaveWorkflow;
using AitoWorkflowAndHuddleGenerator
    .Application
    .Features
    .Workflows
    .Commands
    .ToggleFavorite;
using AitoWorkflowAndHuddleGenerator
    .Application
    .Features
    .Workflows
    .Commands
    .UpdateWorkflow;
using AitoWorkflowAndHuddleGenerator
    .Application
    .Features
    .Workflows
    .Queries
    .GetFavoriteWorkflows;
using AitoWorkflowAndHuddleGenerator
    .Application
    .Features
    .Workflows
    .Queries
    .GetMyWorkflows;
using AitoWorkflowAndHuddleGenerator
    .Application
    .Features
    .Workflows
    .Queries
    .GetWorkflowById;
using AitoWorkflowAndHuddleGenerator
    .Contracts
    .Workflows;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AitoWorkflowAndHuddleGenerator
    .Api
    .Controllers;

[ApiController]
[Route("api/workflows")]
[Authorize(
    Policy = Policies.AccessAsUser)]
public sealed class WorkflowsController
    : ControllerBase
{
    private readonly ISender _sender;

    public WorkflowsController(
        ISender sender)
    {
        _sender = sender;
    }

    [HttpGet]
    [ProducesResponseType(
        typeof(
            IReadOnlyCollection<
                WorkflowSummaryResponse>),
        StatusCodes.Status200OK)]
    public async Task<
        ActionResult<
            IReadOnlyCollection<
                WorkflowSummaryResponse>>>
        GetMyWorkflows(
            [FromQuery] string? search,
            [FromQuery] bool? isFavorite,
            CancellationToken
                cancellationToken)
    {
        IReadOnlyCollection<
            WorkflowSummaryResponse>
            response =
                await _sender.Send(
                    new GetMyWorkflowsQuery(
                        search,
                        isFavorite),
                    cancellationToken);

        return Ok(response);
    }

    [HttpGet("favorites")]
    [ProducesResponseType(
        typeof(
            IReadOnlyCollection<
                WorkflowSummaryResponse>),
        StatusCodes.Status200OK)]
    public async Task<
        ActionResult<
            IReadOnlyCollection<
                WorkflowSummaryResponse>>>
        GetFavorites(
            CancellationToken
                cancellationToken)
    {
        var response =
            await _sender.Send(
                new
                    GetFavoriteWorkflowsQuery(),
                cancellationToken);

        return Ok(response);
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType(
        typeof(WorkflowResponse),
        StatusCodes.Status200OK)]
    [ProducesResponseType(
        StatusCodes.Status404NotFound)]
    public async Task<
        ActionResult<WorkflowResponse>>
        GetById(
            Guid id,
            CancellationToken
                cancellationToken)
    {
        WorkflowResponse response =
            await _sender.Send(
                new GetWorkflowByIdQuery(
                    id),
                cancellationToken);

        return Ok(response);
    }

    [HttpPost]
    [ProducesResponseType(
        typeof(WorkflowResponse),
        StatusCodes.Status201Created)]
    [ProducesResponseType(
        StatusCodes.Status400BadRequest)]
    [ProducesResponseType(
        StatusCodes.Status409Conflict)]
    public async Task<
        ActionResult<WorkflowResponse>>
        Save(
            [FromBody]
            SaveWorkflowRequest request,
            CancellationToken
                cancellationToken)
    {
        WorkflowResponse response =
            await _sender.Send(
                new SaveWorkflowCommand(
                    request.Name,
                    request.Description,
                    request.RoleExternalId,
                    request
                        .ActivityExternalIds),
                cancellationToken);

        return CreatedAtAction(
            nameof(GetById),
            new
            {
                id = response.Id,
            },
            response);
    }

    [HttpPut("{id:guid}")]
    [ProducesResponseType(
        typeof(WorkflowResponse),
        StatusCodes.Status200OK)]
    [ProducesResponseType(
        StatusCodes.Status404NotFound)]
    [ProducesResponseType(
        StatusCodes.Status409Conflict)]
    public async Task<
        ActionResult<WorkflowResponse>>
        Update(
            Guid id,
            [FromBody]
            UpdateWorkflowRequest request,
            CancellationToken
                cancellationToken)
    {
        WorkflowResponse response =
            await _sender.Send(
                new UpdateWorkflowCommand(
                    id,
                    request.Name,
                    request.Description,
                    request.RoleExternalId,
                    request
                        .ActivityExternalIds,
                    request.RowVersion),
                cancellationToken);

        return Ok(response);
    }

    [HttpDelete("{id:guid}")]
    [ProducesResponseType(
        StatusCodes.Status204NoContent)]
    [ProducesResponseType(
        StatusCodes.Status404NotFound)]
    public async Task<IActionResult>
        Delete(
            Guid id,
            CancellationToken
                cancellationToken)
    {
        await _sender.Send(
            new DeleteWorkflowCommand(
                id),
            cancellationToken);

        return NoContent();
    }

    [HttpPatch("{id:guid}/favorite")]
    [ProducesResponseType(
        typeof(
            WorkflowSummaryResponse),
        StatusCodes.Status200OK)]
    [ProducesResponseType(
        StatusCodes.Status404NotFound)]
    [ProducesResponseType(
        StatusCodes.Status409Conflict)]
    public async Task<
        ActionResult<
            WorkflowSummaryResponse>>
        ToggleFavorite(
            Guid id,
            [FromBody]
            ToggleFavoriteRequest request,
            CancellationToken
                cancellationToken)
    {
        WorkflowSummaryResponse response =
            await _sender.Send(
                new ToggleFavoriteCommand(
                    id,
                    request.IsFavorite,
                    request.RowVersion),
                cancellationToken);

        return Ok(response);
    }
}