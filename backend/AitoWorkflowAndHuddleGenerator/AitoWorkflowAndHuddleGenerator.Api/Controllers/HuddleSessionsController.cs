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
public sealed class HuddleSessionsController(ISender sender) : ControllerBase
{
    [HttpGet("api/huddles/{externalId}/session")]
    [ProducesResponseType(typeof(HuddleSessionResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<HuddleSessionResponse>> GetMine(string externalId, CancellationToken cancellationToken)
    {
        HuddleSessionResponse? response = await sender.Send(new GetMyHuddleSessionQuery(externalId), cancellationToken);
        return response is null ? NotFound() : Ok(response);
    }

    [HttpPut("api/huddles/{externalId}/session")]
    public async Task<ActionResult<HuddleSessionResponse>> SaveMine(string externalId, [FromBody] SaveHuddleSessionRequest request, CancellationToken cancellationToken) =>
        Ok(await sender.Send(new SaveHuddleSessionCommand(externalId, request.CurrentPhaseExternalId, request.FacilitatorNotes, request.RowVersion), cancellationToken));

    [HttpPut("api/huddles/{externalId}/session/activities/{activityExternalId}")]
    public async Task<ActionResult<HuddleSessionResponse>> SetActivityCompletion(string externalId, string activityExternalId, [FromBody] SetHuddleActivityCompletionRequest request, CancellationToken cancellationToken) =>
        Ok(await sender.Send(new SetHuddleActivityCompletionCommand(externalId, activityExternalId, request.IsCompleted, request.RowVersion), cancellationToken));

    [HttpPost("api/huddles/{externalId}/session/complete")]
    public async Task<ActionResult<HuddleSessionResponse>> Complete(string externalId, [FromBody] CompleteHuddleSessionRequest request, CancellationToken cancellationToken) =>
        Ok(await sender.Send(new CompleteHuddleSessionCommand(externalId, request.RowVersion), cancellationToken));

    [HttpGet("api/huddle-sessions/me/incomplete")]
    public async Task<ActionResult<IReadOnlyList<IncompleteHuddleSessionResponse>>> GetIncomplete(CancellationToken cancellationToken) =>
        Ok(await sender.Send(new GetMyIncompleteHuddleSessionsQuery(), cancellationToken));
}
