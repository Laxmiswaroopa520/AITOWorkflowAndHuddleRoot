namespace AitoWorkflowAndHuddleGenerator
    .Contracts
    .Workflows;

public sealed record UpdateWorkflowRequest(
    string Name,
    string? Description,
    string RoleExternalId,
    IReadOnlyCollection<string>
        ActivityExternalIds,
    string RowVersion);