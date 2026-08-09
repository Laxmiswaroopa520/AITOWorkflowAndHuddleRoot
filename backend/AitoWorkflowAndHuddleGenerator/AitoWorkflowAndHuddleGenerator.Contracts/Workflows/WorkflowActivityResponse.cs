namespace AitoWorkflowAndHuddleGenerator
    .Contracts
    .Workflows;

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