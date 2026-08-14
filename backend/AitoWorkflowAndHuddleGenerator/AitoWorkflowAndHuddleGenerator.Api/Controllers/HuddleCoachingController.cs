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
/// <summary>
/// Provides authenticated coach discovery, availability, and booking operations for Huddles.
/// </summary>
public sealed class HuddleCoachingController(ISender sender) : ControllerBase
{
    /// <summary>
    /// Gets approved coaches, optionally filtered by Huddle.
    /// </summary>
    /// <param name="huddleExternalId">The optional Huddle external identifier.</param>
    /// <param name="cancellationToken">A token used to cancel the request.</param>
    /// <returns>The available approved coaches.</returns>
    [HttpGet("coaches")]
    /// <summary>
    /// Gets Coaches.
    /// </summary>
    public async Task<ActionResult<IReadOnlyList<CoachResponse>>> GetCoaches([FromQuery] string? huddleExternalId, CancellationToken cancellationToken) =>
        Ok(await sender.Send(new GetCoachesQuery(huddleExternalId), cancellationToken));

    /// <summary>
    /// Gets a coach's available appointment slots within a requested time window.
    /// </summary>
    /// <param name="coachExternalId">The coach external identifier.</param>
    /// <param name="startUtc">The beginning of the availability window in UTC.</param>
    /// <param name="endUtc">The end of the availability window in UTC.</param>
    /// <param name="durationMinutes">The required appointment duration in minutes.</param>
    /// <param name="cancellationToken">A token used to cancel the request.</param>
    /// <returns>The coach's available appointment slots.</returns>
    [HttpGet("coaches/{coachExternalId}/availability")]
    /// <summary>
    /// Gets Availability.
    /// </summary>
    public async Task<ActionResult<CoachAvailabilityResponse>> GetAvailability(string coachExternalId, [FromQuery] DateTime startUtc, [FromQuery] DateTime endUtc, [FromQuery] int durationMinutes, CancellationToken cancellationToken) =>
        Ok(await sender.Send(new GetCoachAvailabilityQuery(coachExternalId, startUtc, endUtc, durationMinutes), cancellationToken));

    /// <summary>
    /// Books a coaching appointment for the authenticated user.
    /// </summary>
    /// <param name="request">The coaching appointment details.</param>
    /// <param name="cancellationToken">A token used to cancel the request.</param>
    /// <returns>The confirmed coach booking.</returns>
    [HttpPost("bookings")]
    /// <summary>
    /// Books .
    /// </summary>
    public async Task<ActionResult<CoachBookingResponse>> Book([FromBody] BookCoachRequest request, CancellationToken cancellationToken) =>
        Ok(await sender.Send(new BookCoachCommand(request), cancellationToken));
}
