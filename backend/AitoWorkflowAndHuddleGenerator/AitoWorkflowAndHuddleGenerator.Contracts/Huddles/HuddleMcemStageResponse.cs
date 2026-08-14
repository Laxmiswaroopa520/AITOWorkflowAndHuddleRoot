namespace AitoWorkflowAndHuddleGenerator.Contracts.Huddles;

/// <summary>
/// Represents the Huddle Mcem Stage Response API contract.
/// </summary>
public sealed record HuddleMcemStageResponse(string ExternalId, string Name, string? Description, int DisplayOrder);
