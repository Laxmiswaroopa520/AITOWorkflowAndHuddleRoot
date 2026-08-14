namespace AitoWorkflowAndHuddleGenerator
    .Contracts
    .Workflows;

/// <summary>
/// Represents the Update Workflow Request API contract.
/// </summary>
public sealed record UpdateWorkflowRequest(
    string Name,
    string? Description,
    string RoleExternalId,
    IReadOnlyCollection<string>
        ActivityExternalIds,
    string RowVersion);