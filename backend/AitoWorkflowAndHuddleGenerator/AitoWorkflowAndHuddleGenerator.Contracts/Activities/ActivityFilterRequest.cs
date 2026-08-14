namespace AitoWorkflowAndHuddleGenerator
    .Contracts
    .Activities;

/// <summary>
/// Represents the Activity Filter Request API contract.
/// </summary>
public sealed class ActivityFilterRequest
{
    public string? RoleId { get; init; }

    public string? WorkflowBucketId { get; init; }

    public string? AiToolId { get; init; }

    public string? Category { get; init; }

    public string? Frequency { get; init; }

    public string? Priority { get; init; }

    public string? ToolCoverageLevel { get; init; }

    public string? TriggerContext { get; init; }

    public string? McemStage { get; init; }

    public string? Search { get; init; }

    public bool IncludeInactive { get; init; }
}