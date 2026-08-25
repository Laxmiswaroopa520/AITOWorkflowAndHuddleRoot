namespace AitoWorkflowAndHuddleGenerator
    .Contracts
    .Activities;

/// <summary>
/// Represents the Activity Ai Tool Response API contract.
/// </summary>
public sealed record ActivityAiToolResponse(
    int Id,
    string ExternalId,
    string Name,
    string? Description,
    string? Color,
    string? IconKey,
    int SortOrder,
    bool IsPrimary);

/*This is not only an AI-tool DTO. It also returns mapping-specific values:

SortOrder
IsPrimary

That allows the frontend to preserve primary and secondary tool ordering.*/