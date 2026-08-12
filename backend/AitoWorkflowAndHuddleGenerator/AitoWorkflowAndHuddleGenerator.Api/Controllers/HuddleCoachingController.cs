using AitoWorkflowAndHuddleGenerator.Api.Authorization;
using AitoWorkflowAndHuddleGenerator.Application.Features.Huddles.Coaching.Commands.BookCoach;
using AitoWorkflowAndHuddleGenerator.Application.Features.Huddles.Coaching.Queries.GetAvailability;
using AitoWorkflowAndHuddleGenerator.Application.Features.Huddles.Coaching.Queries.GetCoaches;
using AitoWorkflowAndHuddleGenerator.Contracts.Huddles.Coaching;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AitoWorkflowAndHuddleGenerator.Api.Controllers;

[ApiController]
[Authorize(Policy = Policies.AccessAsUser)]
[Route("api/huddle-coaching")]
public sealed class HuddleCoachingController(ISender sender) : ControllerBase
{
    [HttpGet("coaches")]
    public async Task<ActionResult<IReadOnlyList<CoachResponse>>> GetCoaches([FromQuery] string? huddleExternalId, CancellationToken cancellationToken) =>
        Ok(await sender.Send(new GetCoachesQuery(huddleExternalId), cancellationToken));

    [HttpGet("coaches/{coachExternalId}/availability")]
    public async Task<ActionResult<CoachAvailabilityResponse>> GetAvailability(string coachExternalId, [FromQuery] DateTime startUtc, [FromQuery] DateTime endUtc, [FromQuery] int durationMinutes, CancellationToken cancellationToken) =>
        Ok(await sender.Send(new GetCoachAvailabilityQuery(coachExternalId, startUtc, endUtc, durationMinutes), cancellationToken));

    [HttpPost("bookings")]
    public async Task<ActionResult<CoachBookingResponse>> Book([FromBody] BookCoachRequest request, CancellationToken cancellationToken) =>
        Ok(await sender.Send(new BookCoachCommand(request), cancellationToken));
}
