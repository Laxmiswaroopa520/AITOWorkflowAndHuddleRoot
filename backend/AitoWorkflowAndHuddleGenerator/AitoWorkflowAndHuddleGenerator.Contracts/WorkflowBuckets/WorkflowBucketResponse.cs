namespace AitoWorkflowAndHuddleGenerator
    .Contracts
    .WorkflowBuckets;

/// <summary>
/// Represents the Workflow Bucket Response API contract.
/// </summary>
public sealed record WorkflowBucketResponse(
    int Id,
    string ExternalId,
    string Name,
    string? Description,
    int SortOrder);