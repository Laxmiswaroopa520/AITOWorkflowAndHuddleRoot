namespace AitoWorkflowAndHuddleGenerator.Contracts.Huddles;

/// <summary>
/// Represents the Recommended Huddle Path Item Response API contract.
/// </summary>
public sealed record RecommendedHuddlePathItemResponse(int Week, int PathOrder, HuddleCatalogItemResponse Huddle);
