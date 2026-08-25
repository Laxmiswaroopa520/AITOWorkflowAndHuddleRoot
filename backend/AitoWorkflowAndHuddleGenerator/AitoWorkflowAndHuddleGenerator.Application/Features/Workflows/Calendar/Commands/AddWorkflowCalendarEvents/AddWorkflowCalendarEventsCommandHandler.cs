using AitoWorkflowAndHuddleGenerator.Application.Abstractions.Calendar;
using AitoWorkflowAndHuddleGenerator.Contracts.Workflows.Calendar;
using MediatR;
namespace AitoWorkflowAndHuddleGenerator.Application.Features.Workflows.Calendar.Commands.AddWorkflowCalendarEvents;
/// <summary>
/// Handles the Add Workflow Calendar Events command.
/// </summary>
public sealed class AddWorkflowCalendarEventsCommandHandler(IWorkflowCalendarService calendarService) : IRequestHandler<AddWorkflowCalendarEventsCommand, AddWorkflowCalendarEventsResponse>
{
    /// <summary>
    /// Handles the request through the application pipeline.
    /// </summary>
    public Task<AddWorkflowCalendarEventsResponse> Handle(AddWorkflowCalendarEventsCommand request, CancellationToken cancellationToken) => calendarService.AddEventsAsync(request.Events, cancellationToken);
}
