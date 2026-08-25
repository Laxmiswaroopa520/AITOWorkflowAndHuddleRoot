namespace AitoWorkflowAndHuddleGenerator.Contracts.Huddles.Coaching;

/// <summary>
/// Represents the Coach Availability Slot Response API contract.
/// </summary>
public sealed record CoachAvailabilitySlotResponse(DateTime StartUtc, DateTime EndUtc);
