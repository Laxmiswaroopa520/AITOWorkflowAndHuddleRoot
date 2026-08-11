namespace AitoWorkflowAndHuddleGenerator.Contracts.Huddles;

public sealed record HuddlePlanItemResponse(
    int Week,
    string RecommendedHuddleExternalId,
    bool IsCustomized,
    HuddleCatalogItemResponse Huddle);
