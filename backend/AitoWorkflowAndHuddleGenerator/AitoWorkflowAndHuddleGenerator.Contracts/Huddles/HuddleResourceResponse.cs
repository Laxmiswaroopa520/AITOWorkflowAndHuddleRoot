namespace AitoWorkflowAndHuddleGenerator.Contracts.Huddles;

/// <summary>
/// Represents the Huddle Resource Response API contract.
/// </summary>
public sealed record HuddleResourceResponse(string ExternalId, string Title, string? Description, string? Url, string? Type, string? LinkLabel, int DisplayOrder);
