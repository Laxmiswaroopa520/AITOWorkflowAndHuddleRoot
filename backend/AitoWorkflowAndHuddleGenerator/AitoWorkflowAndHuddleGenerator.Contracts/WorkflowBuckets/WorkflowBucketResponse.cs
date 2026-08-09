namespace AitoWorkflowAndHuddleGenerator
    .Contracts
    .WorkflowBuckets;

public sealed record WorkflowBucketResponse(
    int Id,
    string ExternalId,
    string Name,
    string? Description,
    int SortOrder);