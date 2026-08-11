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
public sealed class HuddlePlansController(ISender sender) : ControllerBase
{
    [HttpGet("me")]
    [ProducesResponseType(typeof(HuddlePlanResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<ActionResult<HuddlePlanResponse>> GetMine(
        [FromQuery] string roleExternalId,
        CancellationToken cancellationToken) =>
        Ok(await sender.Send(new GetMyHuddlePlanQuery(roleExternalId), cancellationToken));

    [HttpPut("me")]
    [ProducesResponseType(typeof(HuddlePlanResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<ActionResult<HuddlePlanResponse>> SaveMine(
        [FromBody] SaveHuddlePlanRequest request,
        CancellationToken cancellationToken) =>
        Ok(await sender.Send(new SaveHuddlePlanCommand(request.RoleExternalId, request.RowVersion, request.Items), cancellationToken));

    [HttpDelete("me/{roleExternalId}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ResetMine(string roleExternalId, CancellationToken cancellationToken)
    {
        await sender.Send(new ResetHuddlePlanCommand(roleExternalId), cancellationToken);
        return NoContent();
    }
}
