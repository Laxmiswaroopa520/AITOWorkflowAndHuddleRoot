namespace AitoWorkflowAndHuddleGenerator.Contracts.Huddles;

/// <summary>
/// Represents the Recommended Huddle Path Response API contract.
/// </summary>
public sealed record RecommendedHuddlePathResponse(string RoleExternalId, bool IsComplete, string? ConfigurationMessage, IReadOnlyList<RecommendedHuddlePathItemResponse> Items);
