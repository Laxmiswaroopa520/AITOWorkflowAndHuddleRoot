namespace AitoWorkflowAndHuddleGenerator.Contracts.Huddles.Coaching;

/// <summary>
/// Represents the Book Coach Request API contract.
/// </summary>
public sealed record BookCoachRequest(string CoachExternalId, string HuddleExternalId, DateTime StartUtc, DateTime EndUtc, string DisplayTimeZone, string? Question, Guid BookingRequestId);
