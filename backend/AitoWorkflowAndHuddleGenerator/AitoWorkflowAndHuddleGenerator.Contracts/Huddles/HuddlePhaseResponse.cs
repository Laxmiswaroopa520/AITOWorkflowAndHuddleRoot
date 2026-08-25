namespace AitoWorkflowAndHuddleGenerator.Contracts.Huddles;

/// <summary>
/// Represents the Huddle Phase Response API contract.
/// </summary>
public sealed record HuddlePhaseResponse(string ExternalId, string Name, string? Description, int? DurationMinutes, int DisplayOrder, IReadOnlyList<HuddleActivityResponse> Activities);
