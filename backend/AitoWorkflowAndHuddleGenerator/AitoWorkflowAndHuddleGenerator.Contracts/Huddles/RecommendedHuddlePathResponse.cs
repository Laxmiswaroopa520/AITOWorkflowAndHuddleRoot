namespace AitoWorkflowAndHuddleGenerator.Contracts.Huddles;

public sealed record RecommendedHuddlePathResponse(string RoleExternalId, bool IsComplete, string? ConfigurationMessage, IReadOnlyList<RecommendedHuddlePathItemResponse> Items);
