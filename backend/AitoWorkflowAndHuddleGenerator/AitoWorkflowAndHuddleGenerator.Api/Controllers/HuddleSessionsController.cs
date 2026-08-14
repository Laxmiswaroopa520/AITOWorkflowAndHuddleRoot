using AitoWorkflowAndHuddleGenerator.Api.Authorization;
using AitoWorkflowAndHuddleGenerator.Application.Features.Huddles.Sessions.Commands.CompleteHuddleSession;
using AitoWorkflowAndHuddleGenerator.Application.Features.Huddles.Sessions.Commands.SaveHuddleSession;
using AitoWorkflowAndHuddleGenerator.Application.Features.Huddles.Sessions.Commands.SetHuddleActivityCompletion;
using AitoWorkflowAndHuddleGenerator.Application.Features.Huddles.Sessions.Queries.GetMyHuddleSession;
using AitoWorkflowAndHuddleGenerator.Application.Features.Huddles.Sessions.Queries.GetMyIncompleteHuddleSessions;
using AitoWorkflowAndHuddleGenerator.Contracts.Huddles;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AitoWorkflowAndHuddleGenerator.Api.Controllers;

[ApiController]
[Authorize(Policy = Policies.AccessAsUser)]
/// <summary>
/// Manages authenticated users' persistent Huddle sessions and activity progress.
/// </summary>
public sealed class HuddleSessionsController(ISender sender) : ControllerBase
{
    /// <summary>
    /// Gets the authenticated user's session for a Huddle.
    /// </summary>
    /// <param name="externalId">The Huddle external identifier.</param>
    /// <param name="cancellationToken">A token used to cancel the request.</param>
    /// <returns>The user's session, or a not-found response when none exists.</returns>
    [HttpGet("api/huddles/{externalId}/session")]
    [ProducesResponseType(typeof(HuddleSessionResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    /// <summary>
    /// Gets Mine.
    /// </summary>
    public async Task<ActionResult<HuddleSessionResponse>> GetMine(string externalId, CancellationToken cancellationToken)
    {
        HuddleSessionResponse? response = await sender.Send(new GetMyHuddleSessionQuery(externalId), cancellationToken);
        return response is null ? NotFound() : Ok(response);
    }

    /// <summary>
    /// Starts or saves the authenticated user's Huddle session.
    /// </summary>
    /// <param name="externalId">The Huddle external identifier.</param>
    /// <param name="request">The current phase, facilitator notes, and row version.</param>
    /// <param name="cancellationToken">A token used to cancel the request.</param>
    /// <returns>The persisted Huddle session.</returns>
    [HttpPut("api/huddles/{externalId}/session")]
    /// <summary>
    /// Saves Mine.
    /// </summary>
    public async Task<ActionResult<HuddleSessionResponse>> SaveMine(string externalId, [FromBody] SaveHuddleSessionRequest request, CancellationToken cancellationToken) =>
        Ok(await sender.Send(new SaveHuddleSessionCommand(externalId, request.CurrentPhaseExternalId, request.FacilitatorNotes, request.RowVersion), cancellationToken));

    /// <summary>
    /// Marks a Huddle activity complete or incomplete for the authenticated user.
    /// </summary>
    /// <param name="externalId">The Huddle external identifier.</param>
    /// <param name="activityExternalId">The activity external identifier.</param>
    /// <param name="request">The completion state and session row version.</param>
    /// <param name="cancellationToken">A token used to cancel the request.</param>
    /// <returns>The updated Huddle session.</returns>
    [HttpPut("api/huddles/{externalId}/session/activities/{activityExternalId}")]
    /// <summary>
    /// Executes the Set Activity Completion operation.
    /// </summary>
    public async Task<ActionResult<HuddleSessionResponse>> SetActivityCompletion(string externalId, string activityExternalId, [FromBody] SetHuddleActivityCompletionRequest request, CancellationToken cancellationToken) =>
        Ok(await sender.Send(new SetHuddleActivityCompletionCommand(externalId, activityExternalId, request.IsCompleted, request.RowVersion), cancellationToken));

    /// <summary>
    /// Completes the authenticated user's Huddle session.
    /// </summary>
    /// <param name="externalId">The Huddle external identifier.</param>
    /// <param name="request">The current session row version.</param>
    /// <param name="cancellationToken">A token used to cancel the request.</param>
    /// <returns>The completed Huddle session.</returns>
    [HttpPost("api/huddles/{externalId}/session/complete")]
    /// <summary>
    /// Executes the Complete operation.
    /// </summary>
    public async Task<ActionResult<HuddleSessionResponse>> Complete(string externalId, [FromBody] CompleteHuddleSessionRequest request, CancellationToken cancellationToken) =>
        Ok(await sender.Send(new CompleteHuddleSessionCommand(externalId, request.RowVersion), cancellationToken));

    /// <summary>
    /// Gets the authenticated user's incomplete Huddle sessions that can be resumed.
    /// </summary>
    /// <param name="cancellationToken">A token used to cancel the request.</param>
    /// <returns>The incomplete resumable Huddle sessions.</returns>
    [HttpGet("api/huddle-sessions/me/incomplete")]
    /// <summary>
    /// Gets Incomplete.
    /// </summary>
    public async Task<ActionResult<IReadOnlyList<IncompleteHuddleSessionResponse>>> GetIncomplete(CancellationToken cancellationToken) =>
        Ok(await sender.Send(new GetMyIncompleteHuddleSessionsQuery(), cancellationToken));
}
