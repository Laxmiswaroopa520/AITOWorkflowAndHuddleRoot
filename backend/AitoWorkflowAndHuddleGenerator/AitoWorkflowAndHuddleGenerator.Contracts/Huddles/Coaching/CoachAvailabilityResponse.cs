namespace AitoWorkflowAndHuddleGenerator.Contracts.Huddles.Coaching;

public sealed record CoachAvailabilityResponse(string CoachExternalId, string CoachTimeZone, IReadOnlyList<CoachAvailabilitySlotResponse> Slots);
