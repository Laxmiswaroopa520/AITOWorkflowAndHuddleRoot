namespace AitoWorkflowAndHuddleGenerator.Contracts.Huddles;

/// <summary>
/// Represents the Huddle Role Response API contract.
/// </summary>
public sealed record HuddleRoleResponse(string ExternalId, string Name, string Abbreviation, string? Segment);
