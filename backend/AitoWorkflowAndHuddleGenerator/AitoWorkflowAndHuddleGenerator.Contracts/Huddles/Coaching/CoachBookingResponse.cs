namespace AitoWorkflowAndHuddleGenerator.Contracts.Huddles.Coaching;

/// <summary>
/// Represents the Coach Booking Response API contract.
/// </summary>
public sealed record CoachBookingResponse(string EventId, string CoachExternalId, string CoachDisplayName, DateTime StartUtc, DateTime EndUtc, string? JoinUrl, string? WebLink);
