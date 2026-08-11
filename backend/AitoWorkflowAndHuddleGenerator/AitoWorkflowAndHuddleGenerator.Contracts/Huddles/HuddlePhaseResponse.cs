namespace AitoWorkflowAndHuddleGenerator.Contracts.Huddles;

public sealed record HuddlePhaseResponse(string ExternalId, string Name, string? Description, int? DurationMinutes, int DisplayOrder, IReadOnlyList<HuddleActivityResponse> Activities);
