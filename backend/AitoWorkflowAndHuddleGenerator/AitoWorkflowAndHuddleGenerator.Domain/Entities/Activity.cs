//Stores activity details, role and workflow-bucket relationships, prompts, duration, priority, frequency, trigger context, and business outcome.
using AitoWorkflowAndHuddleGenerator.Domain.Common;
using AitoWorkflowAndHuddleGenerator.Domain.Enums;

namespace AitoWorkflowAndHuddleGenerator.Domain.Entities;

public sealed class Activity : AuditableEntity<int>
{
    public string ExternalId { get; set; } = string.Empty;

    public string Title { get; set; } = string.Empty;

    public string? Description { get; set; }

    public int RoleId { get; set; }

    public Role Role { get; set; } = null!;

    public int WorkflowBucketId { get; set; }

    public WorkflowBucket WorkflowBucket { get; set; } = null!;

    public ActivityCategory Category { get; set; }

    public ActivityFrequency Frequency { get; set; }

    public ActivityPriority Priority { get; set; }

    public ToolCoverageLevel ToolCoverageLevel { get; set; }

    public TriggerContext TriggerContext { get; set; }

    public McemStage McemStage { get; set; }

    public int DurationMinutes { get; set; }

    public string? BusinessOutcome { get; set; }

    public string? BeginnerPrompt { get; set; }

    public string? AdvancedPrompt { get; set; }

    public string? SuggestedOutputs { get; set; }

    public int SortOrder { get; set; }

    public bool IsActive { get; set; } = true;

    public ICollection<ActivityAiTool> ActivityAiTools { get; set; } =
        new List<ActivityAiTool>();

    public ICollection<UserWorkflowActivity> UserWorkflowActivities
    { get; set; } = new List<UserWorkflowActivity>();
}