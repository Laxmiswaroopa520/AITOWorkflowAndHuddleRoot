namespace AitoWorkflowAndHuddleGenerator.Contracts.Workflows.Calendar;
/// <summary>
/// Represents the Add Workflow Calendar Events Response API contract.
/// </summary>
public sealed record AddWorkflowCalendarEventsResponse(int CreatedCount, IReadOnlyList<string> EventIds);
