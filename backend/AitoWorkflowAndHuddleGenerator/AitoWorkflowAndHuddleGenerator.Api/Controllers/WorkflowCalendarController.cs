using AitoWorkflowAndHuddleGenerator.Application.Features.Workflows.Calendar.Commands.AddWorkflowCalendarEvents;
using AitoWorkflowAndHuddleGenerator.Contracts.Workflows.Calendar;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
namespace AitoWorkflowAndHuddleGenerator.Api.Controllers;
[ApiController]
[Authorize(Policy = "AccessAsUser")]
[Route("api/workflows/calendar")]
/// <summary>
/// Adds generated workflow activities to the authenticated user's calendar.
/// </summary>
public sealed class WorkflowCalendarController(ISender sender) : ControllerBase
{
    /// <summary>
    /// Creates calendar events for the supplied workflow activities.
    /// </summary>
    /// <param name="request">The workflow calendar events to create.</param>
    /// <param name="cancellationToken">A token used to cancel the request.</param>
    /// <returns>The result of each calendar event creation request.</returns>
    [HttpPost("events")]
    /// <summary>
    /// Registers or adds Events functionality.
    /// </summary>
    public async Task<ActionResult<AddWorkflowCalendarEventsResponse>> AddEvents(AddWorkflowCalendarEventsRequest request, CancellationToken cancellationToken) => Ok(await sender.Send(new AddWorkflowCalendarEventsCommand(request.Events), cancellationToken));
}
