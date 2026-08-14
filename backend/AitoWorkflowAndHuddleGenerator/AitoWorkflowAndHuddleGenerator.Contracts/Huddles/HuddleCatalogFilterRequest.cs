namespace AitoWorkflowAndHuddleGenerator.Contracts.Huddles;

/// <summary>
/// Represents the Huddle Catalog Filter Request API contract.
/// </summary>
public sealed record HuddleCatalogFilterRequest(
    string? RoleExternalId,
    string? FocusAreaExternalId,
    string? AgentExternalId,
    string? Type,
    string? Search,
    string? Sort);
