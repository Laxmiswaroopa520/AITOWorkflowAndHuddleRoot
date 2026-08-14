using AitoWorkflowAndHuddleGenerator.Api.Authorization;
using AitoWorkflowAndHuddleGenerator.Application.Features.Huddles.Plans.Commands.ResetHuddlePlan;
using AitoWorkflowAndHuddleGenerator.Application.Features.Huddles.Plans.Commands.SaveHuddlePlan;
using AitoWorkflowAndHuddleGenerator.Application.Features.Huddles.Plans.Queries.GetMyHuddlePlan;
using AitoWorkflowAndHuddleGenerator.Contracts.Huddles;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AitoWorkflowAndHuddleGenerator.Api.Controllers;

[ApiController]
[Route("api/huddle-plans")]
[Authorize(Policy = Policies.AccessAsUser)]
/// <summary>
/// Manages the authenticated user's persistent role-based Huddle learning plans.
/// </summary>
public sealed class HuddlePlansController(ISender sender) : ControllerBase
{
    /// <summary>
    /// Gets the authenticated user's plan for a role, creating the recommended plan when needed.
    /// </summary>
    /// <param name="roleExternalId">The role external identifier.</param>
    /// <param name="cancellationToken">A token used to cancel the request.</param>
    /// <returns>The user's persisted or recommended Huddle plan.</returns>
    [HttpGet("me")]
    [ProducesResponseType(typeof(HuddlePlanResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    /// <summary>
    /// Gets Mine.
    /// </summary>
    public async Task<ActionResult<HuddlePlanResponse>> GetMine(
        [FromQuery] string roleExternalId,
        CancellationToken cancellationToken) =>
        Ok(await sender.Send(new GetMyHuddlePlanQuery(roleExternalId), cancellationToken));

    /// <summary>
    /// Saves the authenticated user's customized Huddle plan using optimistic concurrency.
    /// </summary>
    /// <param name="request">The role, ordered plan items, and row version.</param>
    /// <param name="cancellationToken">A token used to cancel the request.</param>
    /// <returns>The saved Huddle plan.</returns>
    [HttpPut("me")]
    [ProducesResponseType(typeof(HuddlePlanResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    /// <summary>
    /// Saves Mine.
    /// </summary>
    public async Task<ActionResult<HuddlePlanResponse>> SaveMine(
        [FromBody] SaveHuddlePlanRequest request,
        CancellationToken cancellationToken) =>
        Ok(await sender.Send(new SaveHuddlePlanCommand(request.RoleExternalId, request.RowVersion, request.Items), cancellationToken));

    /// <summary>
    /// Resets the authenticated user's plan for a role to the governed recommendation.
    /// </summary>
    /// <param name="roleExternalId">The role external identifier.</param>
    /// <param name="cancellationToken">A token used to cancel the request.</param>
    /// <returns>A response with no content after the plan is reset.</returns>
    [HttpDelete("me/{roleExternalId}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    /// <summary>
    /// Executes the Reset Mine operation.
    /// </summary>
    public async Task<IActionResult> ResetMine(string roleExternalId, CancellationToken cancellationToken)
    {
        await sender.Send(new ResetHuddlePlanCommand(roleExternalId), cancellationToken);
        return NoContent();
    }
}
