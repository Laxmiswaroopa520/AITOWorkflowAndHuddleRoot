using AitoWorkflowAndHuddleGenerator.Contracts.Workflows.Calendar;
namespace AitoWorkflowAndHuddleGenerator.Application.Abstractions.Calendar;
/// <summary>
/// Provides IWorkflow Calendar operations.
/// </summary>
public interface IWorkflowCalendarService
{
    Task<AddWorkflowCalendarEventsResponse> AddEventsAsync(IReadOnlyList<WorkflowCalendarEventRequest> events, CancellationToken cancellationToken);
}
