namespace AitoWorkflowAndHuddleGenerator
    .Contracts
    .Workflows;

/// <summary>
/// Represents the Workflow Activity Response API contract.
/// </summary>
public sealed record WorkflowActivityResponse(
    int Id,
    string ExternalId,
    string Title,
    string? Description,
    string WorkflowBucketExternalId,
    string WorkflowBucketName,
    string Category,
    string Frequency,
    string Priority,
    int DurationMinutes,
    int SortOrder);