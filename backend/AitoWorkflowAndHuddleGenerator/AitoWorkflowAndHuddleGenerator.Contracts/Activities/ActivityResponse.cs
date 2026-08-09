namespace AitoWorkflowAndHuddleGenerator
    .Contracts
    .Activities;

public sealed record ActivityResponse(
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
    string? BeginnerPrompt,
    string? AdvancedPrompt,
    string? SuggestedOutputs,
    int SortOrder,
    IReadOnlyList<ActivityAiToolResponse> AiTools);

/*This DTO contains the complete activity information required by later Workflow and Huddle screens.*/