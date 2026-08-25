using AitoWorkflowAndHuddleGenerator.Api.Authorization;
using AitoWorkflowAndHuddleGenerator.Application.Features.Workflows.Commands.DeleteWorkflow;
using AitoWorkflowAndHuddleGenerator.Application.Features.Workflows.Commands.SaveWorkflow;
using AitoWorkflowAndHuddleGenerator.Application.Features.Workflows.Commands.ToggleFavorite;
using AitoWorkflowAndHuddleGenerator.Application.Features.Workflows.Commands.UpdateWorkflow;
using AitoWorkflowAndHuddleGenerator.Application.Features.Workflows.Queries.GetFavoriteWorkflows;
using AitoWorkflowAndHuddleGenerator.Application.Features.Workflows.Queries.GetMyWorkflows;
using AitoWorkflowAndHuddleGenerator.Application.Features.Workflows.Queries.GetWorkflowById;
using AitoWorkflowAndHuddleGenerator.Contracts.Workflows;
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
/// <summary>
/// Manages saved workflows owned by the authenticated user.
/// </summary>
public sealed class WorkflowsController
    : ControllerBase
{
    private readonly ISender sender;

    /// <summary>
    /// Initializes a new instance of the <see cref="WorkflowsController"/> class.
    /// </summary>
    /// <param name="sender">The mediator used to dispatch workflow requests.</param>
    public WorkflowsController(
        ISender sender)
    {
        this.sender = sender;
    }

    /// <summary>
    /// Gets the authenticated user's workflows using optional search and favorite filters.
    /// </summary>
    /// <param name="search">Optional text used to search workflow names and descriptions.</param>
    /// <param name="isFavorite">Optional favorite-state filter.</param>
    /// <param name="cancellationToken">A token used to cancel the request.</param>
    /// <returns>The matching saved workflow summaries.</returns>
    [HttpGet]
    [ProducesResponseType(typeof(
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
                await sender.Send(
                    new GetMyWorkflowsQuery(
                        search,
                        isFavorite),
                    cancellationToken);

        return Ok(response);
    }

    /// <summary>
    /// Gets the authenticated user's favorite workflows.
    /// </summary>
    /// <param name="cancellationToken">A token used to cancel the request.</param>
    /// <returns>The favorite workflow summaries.</returns>
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
            await sender.Send(
                new
                    GetFavoriteWorkflowsQuery(),
                cancellationToken);

        return Ok(response);
    }

    /// <summary>
    /// Gets an owned workflow by its identifier.
    /// </summary>
    /// <param name="id">The workflow identifier.</param>
    /// <param name="cancellationToken">A token used to cancel the request.</param>
    /// <returns>The requested workflow.</returns>
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
            await sender.Send(
                new GetWorkflowByIdQuery(
                    id),
                cancellationToken);

        return Ok(response);
    }

    /// <summary>
    /// Saves a new workflow for the authenticated user.
    /// </summary>
    /// <param name="request">The workflow name, role, description, and activities.</param>
    /// <param name="cancellationToken">A token used to cancel the request.</param>
    /// <returns>The newly created workflow.</returns>
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
            await sender.Send(
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

    /// <summary>
    /// Updates an owned workflow using optimistic concurrency.
    /// </summary>
    /// <param name="id">The workflow identifier.</param>
    /// <param name="request">The updated workflow values and row version.</param>
    /// <param name="cancellationToken">A token used to cancel the request.</param>
    /// <returns>The updated workflow.</returns>
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
            await sender.Send(
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

    /// <summary>
    /// Deletes a workflow owned by the authenticated user.
    /// </summary>
    /// <param name="id">The workflow identifier.</param>
    /// <param name="cancellationToken">A token used to cancel the request.</param>
    /// <returns>A response with no content after deletion.</returns>
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(
        StatusCodes.Status204NoContent)]
    [ProducesResponseType(
        StatusCodes.Status404NotFound)]
    /// <summary>
    /// Executes the Delete operation.
    /// </summary>
    public async Task<IActionResult>
        Delete(
            Guid id,
            CancellationToken
                cancellationToken)
    {
        await sender.Send(
            new DeleteWorkflowCommand(
                id),
            cancellationToken);

        return NoContent();
    }

    /// <summary>
    /// Sets the favorite state of an owned workflow using optimistic concurrency.
    /// </summary>
    /// <param name="id">The workflow identifier.</param>
    /// <param name="request">The desired favorite state and row version.</param>
    /// <param name="cancellationToken">A token used to cancel the request.</param>
    /// <returns>The updated workflow summary.</returns>
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
            await sender.Send(
                new ToggleFavoriteCommand(
                    id,
                    request.IsFavorite,
                    request.RowVersion),
                cancellationToken);

        return Ok(response);
    }
}
