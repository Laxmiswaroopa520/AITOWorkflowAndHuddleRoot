namespace AitoWorkflowAndHuddleGenerator.Contracts.Huddles.Coaching;

public sealed record CoachBookingResponse(string EventId, string CoachExternalId, string CoachDisplayName, DateTime StartUtc, DateTime EndUtc, string? JoinUrl, string? WebLink);
