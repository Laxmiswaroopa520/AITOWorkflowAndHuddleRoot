using AitoWorkflowAndHuddleGenerator
    .Api
    .Authorization;
using AitoWorkflowAndHuddleGenerator
    .Application
    .Features
    .Activities
    .Queries
    .GetActivities;
using AitoWorkflowAndHuddleGenerator
    .Application
    .Features
    .Activities
    .Queries
    .GetActivitiesByRole;
using AitoWorkflowAndHuddleGenerator
    .Application
    .Features
    .Activities
    .Queries
    .GetActivityById;
using AitoWorkflowAndHuddleGenerator
    .Contracts
    .Activities;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AitoWorkflowAndHuddleGenerator
    .Api
    .Controllers;

[ApiController]
[Route("api/activities")]
[Authorize(Policy = Policies.AccessAsUser)]
public sealed class ActivitiesController
    : ControllerBase
{
    private readonly ISender _sender;

    public ActivitiesController(ISender sender)
    {
        _sender = sender;
    }

    [HttpGet]
    [ProducesResponseType( typeof(IReadOnlyList<ActivityResponse>),StatusCodes.Status200OK)]
    [ProducesResponseType( StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<IReadOnlyList<ActivityResponse>>>
        GetActivities(
            [FromQuery] ActivityFilterRequest filters,
            CancellationToken cancellationToken)
    {
        var query = new GetActivitiesQuery(
            filters.RoleId,
            filters.WorkflowBucketId,
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
            await _sender.Send(
                query,
                cancellationToken);

        return Ok(response);
    }

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
    public async Task<ActionResult<ActivityResponse>>
        GetActivityById(
            int id,
            CancellationToken cancellationToken)
    {
        ActivityResponse? response =
            await _sender.Send(
                new GetActivityByIdQuery(id),
                cancellationToken);

        return response is null
            ? NotFound()
            : Ok(response);
    }

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
            await _sender.Send(
                new GetActivitiesByRoleQuery(
                    roleExternalId),
                cancellationToken);

        return Ok(response);
    }
}