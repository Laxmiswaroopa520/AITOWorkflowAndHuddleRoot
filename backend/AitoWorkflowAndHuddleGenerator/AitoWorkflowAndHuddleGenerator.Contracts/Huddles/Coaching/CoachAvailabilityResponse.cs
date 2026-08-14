namespace AitoWorkflowAndHuddleGenerator.Contracts.Huddles.Coaching;

/// <summary>
/// Represents the Coach Availability Response API contract.
/// </summary>
public sealed record CoachAvailabilityResponse(string CoachExternalId, string CoachTimeZone, IReadOnlyList<CoachAvailabilitySlotResponse> Slots);
