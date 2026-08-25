namespace AitoWorkflowAndHuddleGenerator.Contracts.Huddles;

/// <summary>
/// Represents the Huddle Plan Item Response API contract.
/// </summary>
public sealed record HuddlePlanItemResponse(
    int Week,
    string RecommendedHuddleExternalId,
    bool IsCustomized,
    HuddleCatalogItemResponse Huddle);
