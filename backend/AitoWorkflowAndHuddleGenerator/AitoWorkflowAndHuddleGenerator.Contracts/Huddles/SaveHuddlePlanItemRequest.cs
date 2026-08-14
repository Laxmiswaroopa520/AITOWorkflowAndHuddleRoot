namespace AitoWorkflowAndHuddleGenerator.Contracts.Huddles;

/// <summary>
/// Represents the Save Huddle Plan Item Request API contract.
/// </summary>
public sealed record SaveHuddlePlanItemRequest(int Week, string HuddleExternalId);
