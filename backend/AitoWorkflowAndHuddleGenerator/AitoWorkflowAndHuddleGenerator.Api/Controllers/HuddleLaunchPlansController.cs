using AitoWorkflowAndHuddleGenerator.Api.Authorization;
using AitoWorkflowAndHuddleGenerator.Application.Features.Huddles.LaunchPlans.Commands.ResetHuddleLaunchPlan;
using AitoWorkflowAndHuddleGenerator.Application.Features.Huddles.LaunchPlans.Commands.SaveHuddleLaunchPlan;
using AitoWorkflowAndHuddleGenerator.Application.Features.Huddles.LaunchPlans.Queries.GetMyHuddleLaunchPlan;
using AitoWorkflowAndHuddleGenerator.Contracts.Huddles;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AitoWorkflowAndHuddleGenerator.Api.Controllers;

/// <summary>Manages the authenticated user's Frontier Accelerator launch plan.</summary>
[ApiController]
[Route("api/huddle-launch-plans")]
[Authorize(Policy = Policies.AccessAsUser)]
public sealed class HuddleLaunchPlansController(ISender sender) : ControllerBase
{
    /// <summary>Gets the current user's launch plan when one exists.</summary>
    [HttpGet("me")]
    [ProducesResponseType(typeof(HuddleLaunchPlanResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<ActionResult<HuddleLaunchPlanResponse?>> GetMine(CancellationToken cancellationToken) =>
        Ok(await sender.Send(new GetMyHuddleLaunchPlanQuery(), cancellationToken));

    /// <summary>Creates or updates the current user's launch plan.</summary>
    [HttpPut("me")]
    [ProducesResponseType(typeof(HuddleLaunchPlanResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<ActionResult<HuddleLaunchPlanResponse>> SaveMine([FromBody] SaveHuddleLaunchPlanRequest request, CancellationToken cancellationToken) =>
        Ok(await sender.Send(new SaveHuddleLaunchPlanCommand(request.TeamName, request.CohortName, request.StartDate, request.EndDate, request.SponsorName, request.Managers, request.Facilitators, request.ProgramLead, request.TaskStateJson, request.RowVersion), cancellationToken));

    /// <summary>Deletes the current user's launch plan.</summary>
    [HttpDelete("me")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> ResetMine(CancellationToken cancellationToken)
    {
        await sender.Send(new ResetHuddleLaunchPlanCommand(), cancellationToken);
        return NoContent();
    }
}
