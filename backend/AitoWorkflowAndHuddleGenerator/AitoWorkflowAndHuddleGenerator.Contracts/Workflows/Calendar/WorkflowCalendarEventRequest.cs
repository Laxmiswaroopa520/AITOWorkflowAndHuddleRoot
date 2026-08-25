namespace AitoWorkflowAndHuddleGenerator.Contracts.Workflows.Calendar;
/// <summary>
/// Represents the Workflow Calendar Event Request API contract.
/// </summary>
public sealed record WorkflowCalendarEventRequest(Guid RequestId, string Subject, string? Body, DateTime StartUtc, DateTime EndUtc, string TimeZone);
