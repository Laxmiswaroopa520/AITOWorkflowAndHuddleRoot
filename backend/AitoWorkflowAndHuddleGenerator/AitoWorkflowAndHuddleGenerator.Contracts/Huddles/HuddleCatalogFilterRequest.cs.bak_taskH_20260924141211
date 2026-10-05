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
    string? Sort,
    /// <summary>Scopes the reported activity counts to one role without filtering the results.</summary>
    string? PlacementRoleExternalId = null,
    /// <summary>Restricts the result to the additional content defined for this role.</summary>
    string? AdditionalContentRoleExternalId = null,
    /// <summary>Restricts the result to additional content across all roles.</summary>
    bool AdditionalContentOnly = false);
