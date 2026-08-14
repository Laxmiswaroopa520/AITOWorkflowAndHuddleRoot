//1.Get all activities with filters
//2. Get one activity by ID
//3. Get activities for a specific role

using AitoWorkflowAndHuddleGenerator.Api.Authorization;
using AitoWorkflowAndHuddleGenerator.Application.Features.Activities.Queries.GetActivities;
using AitoWorkflowAndHuddleGenerator.Application.Features.Activities.Queries.GetActivitiesByRole;
using AitoWorkflowAndHuddleGenerator.Application.Features.Activities.Queries.GetActivityById;
using AitoWorkflowAndHuddleGenerator.Contracts.Activities;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AitoWorkflowAndHuddleGenerator
    .Api
    .Controllers;

[ApiController]
[Route("api/activities")]
[Authorize(Policy = Policies.AccessAsUser)]
/// <summary>
/// Provides authenticated access to the workflow activity catalog.
/// </summary>
public sealed class ActivitiesController
    : ControllerBase
{
    private readonly ISender sender;

    /// <summary>
    /// Initializes a new instance of the <see cref="ActivitiesController"/> class.
    /// </summary>
    /// <param name="sender">The mediator used to dispatch activity queries.</param>
    public ActivitiesController(ISender sender)
    {
        this.sender = sender;
    }

    /// <summary>
    /// Gets workflow activities that match the supplied catalog filters.
    /// </summary>
    /// <param name="filters">The activity catalog filters.</param>
    /// <param name="cancellationToken">A token used to cancel the request.</param>
    /// <returns>The matching workflow activities.</returns>
    [HttpGet]
    [ProducesResponseType( typeof(IReadOnlyList<ActivityResponse>),StatusCodes.Status200OK)]
    [ProducesResponseType( StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    /// <summary>
    /// Gets Activities.
    /// </summary>
    public async Task<ActionResult<IReadOnlyList<ActivityResponse>>>
        GetActivities(
            [FromQuery] ActivityFilterRequest filters,
            CancellationToken cancellationToken)
    {
        var query = new GetActivitiesQuery(  filters.RoleId,filters.WorkflowBucketId,
            filters.AiToolId,
            filters.Category,
            filters.Frequency,
            filters.Priority,
            filters.ToolCoverageLevel,
            filters.TriggerContext,
            filters.McemStage,
            filters.Search,
            filters.IncludeInactive);

        IReadOnlyList<ActivityResponse> response =
            await sender.Send(
                query,
                cancellationToken);

        return Ok(response);
    }

    /// <summary>
    /// Gets a workflow activity by its numeric identifier.
    /// </summary>
    /// <param name="id">The activity identifier.</param>
    /// <param name="cancellationToken">A token used to cancel the request.</param>
    /// <returns>The requested activity, or a not-found response.</returns>
    [HttpGet("{id:int}")]
    [ProducesResponseType(
        typeof(ActivityResponse),
        StatusCodes.Status200OK)]
    [ProducesResponseType(
        StatusCodes.Status404NotFound)]
    [ProducesResponseType(
        StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(
        StatusCodes.Status403Forbidden)]
    /// <summary>
    /// Gets Activity By Id.
    /// </summary>
    public async Task<ActionResult<ActivityResponse>>
        GetActivityById(
            int id,
            CancellationToken cancellationToken)
    {
        ActivityResponse? response =
            await sender.Send(
                new GetActivityByIdQuery(id),
                cancellationToken);

        return response is null
            ? NotFound()
            : Ok(response);
    }

    /// <summary>
    /// Gets workflow activities available to the specified role.
    /// </summary>
    /// <param name="roleExternalId">The stable external identifier of the role.</param>
    /// <param name="cancellationToken">A token used to cancel the request.</param>
    /// <returns>The activities mapped to the role.</returns>
    [HttpGet("by-role/{roleExternalId}")]
    [ProducesResponseType(
        typeof(IReadOnlyList<ActivityResponse>),
        StatusCodes.Status200OK)]
    [ProducesResponseType(
        StatusCodes.Status400BadRequest)]
    [ProducesResponseType(
        StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(
        StatusCodes.Status403Forbidden)]
    public async Task<
        ActionResult<IReadOnlyList<ActivityResponse>>>
        GetActivitiesByRole(
            string roleExternalId,
            CancellationToken cancellationToken)
    {
        IReadOnlyList<ActivityResponse> response =
            await sender.Send(
                new GetActivitiesByRoleQuery(
                    roleExternalId),
                cancellationToken);

        return Ok(response);
    }
}
