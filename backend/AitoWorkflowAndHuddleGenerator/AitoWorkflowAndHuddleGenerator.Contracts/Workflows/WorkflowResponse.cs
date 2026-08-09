namespace AitoWorkflowAndHuddleGenerator
    .Contracts
    .Workflows;

public sealed record WorkflowResponse(
    Guid Id,
    string Name,
    string? Description,
    string OwnerObjectId,
    string OwnerEmail,
    string OwnerDisplayName,
    string RoleExternalId,
    string RoleName,
    string RoleAbbreviation,
    int TotalDurationMinutes,
    bool IsFavorite,
    DateTimeOffset CreatedAtUtc,
    DateTimeOffset? UpdatedAtUtc,
    string RowVersion,
    IReadOnlyCollection<
        WorkflowActivityResponse
    > Activities);