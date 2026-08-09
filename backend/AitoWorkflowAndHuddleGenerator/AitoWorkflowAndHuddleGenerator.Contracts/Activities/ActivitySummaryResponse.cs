namespace AitoWorkflowAndHuddleGenerator
    .Contracts
    .Activities;

public sealed record ActivitySummaryResponse(
    int Id,
    string ExternalId,
    string Title,
    string? Description,
    string RoleExternalId,
    string RoleName,
    string RoleAbbreviation,
    string WorkflowBucketExternalId,
    string WorkflowBucketName,
    string Category,
    string Frequency,
    string Priority,
    string ToolCoverageLevel,
    string TriggerContext,
    string McemStage,
    int DurationMinutes,
    string? BusinessOutcome,
    int SortOrder,
    IReadOnlyList<ActivityAiToolResponse> AiTools);