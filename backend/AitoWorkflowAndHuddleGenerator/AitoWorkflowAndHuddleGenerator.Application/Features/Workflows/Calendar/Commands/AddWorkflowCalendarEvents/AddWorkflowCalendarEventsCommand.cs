using AitoWorkflowAndHuddleGenerator.Contracts.Workflows.Calendar;
using MediatR;
namespace AitoWorkflowAndHuddleGenerator.Application.Features.Workflows.Calendar.Commands.AddWorkflowCalendarEvents;
/// <summary>
/// Represents the Add Workflow Calendar Events Command command.
/// </summary>
public sealed record AddWorkflowCalendarEventsCommand(IReadOnlyList<WorkflowCalendarEventRequest> Events) : IRequest<AddWorkflowCalendarEventsResponse>;
