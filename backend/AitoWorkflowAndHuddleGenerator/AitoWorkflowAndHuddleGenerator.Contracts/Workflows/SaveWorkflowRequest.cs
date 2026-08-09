namespace AitoWorkflowAndHuddleGenerator
    .Contracts
    .Workflows;

public sealed record SaveWorkflowRequest(
    string Name,
    string? Description,
    string RoleExternalId,
    IReadOnlyCollection<string>
        ActivityExternalIds);


/*The frontend must not send:

OwnerObjectId
OwnerEmail
OwnerDisplayName
TotalDurationMinutes
CreatedAtUtc
UpdatedAtUtc

Those values are backend-owned.*/