namespace AitoWorkflowAndHuddleGenerator.Contracts.Huddles;

public sealed record HuddleCatalogFilterRequest(
    string? RoleExternalId,
    string? FocusAreaExternalId,
    string? AgentExternalId,
    string? Type,
    string? Search,
    string? Sort);
