namespace AitoWorkflowAndHuddleGenerator.Contracts.Workflows.Calendar;
/// <summary>
/// Represents the Add Workflow Calendar Events Request API contract.
/// </summary>
public sealed record AddWorkflowCalendarEventsRequest(IReadOnlyList<WorkflowCalendarEventRequest> Events);
