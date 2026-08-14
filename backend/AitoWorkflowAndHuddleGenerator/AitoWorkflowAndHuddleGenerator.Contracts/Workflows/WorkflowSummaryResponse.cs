namespace AitoWorkflowAndHuddleGenerator
    .Contracts
    .Workflows;

/// <summary>
/// Represents the Workflow Summary Response API contract.
/// </summary>
public sealed record WorkflowSummaryResponse(
    Guid Id,
    string Name,
    string? Description,
    string RoleExternalId,
    string RoleName,
    string RoleAbbreviation,
    int ActivityCount,
    int TotalDurationMinutes,
    bool IsFavorite,
    DateTimeOffset CreatedAtUtc,
    DateTimeOffset? UpdatedAtUtc,
    string RowVersion);