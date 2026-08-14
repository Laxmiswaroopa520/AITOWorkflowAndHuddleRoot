using AitoWorkflowAndHuddleGenerator.Domain.Common;

namespace AitoWorkflowAndHuddleGenerator.Domain.Entities;

/// <summary>
/// Represents the Huddle Topic model.
/// </summary>
public sealed class HuddleTopic : AuditableEntity<int>
{
    public string ExternalId { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Type { get; set; } = string.Empty;
    public string PublicationStatus { get; set; } = "WorkingDraft";
    public int? HuddleFocusAreaId { get; set; }
    public HuddleFocusArea? HuddleFocusArea { get; set; }
    public int? DurationMinutes { get; set; }
    public int? RecommendationPriority { get; set; }
    public string? AudienceDescription { get; set; }
    public string? TodayObjective { get; set; }
    public string? UseCase { get; set; }
    public string? WhyItMatters { get; set; }
    public string? DesiredOutcome { get; set; }
    public string? StepsToGetStarted { get; set; }
    public string? ReflectionPrompt { get; set; }
    public string? CommitmentPrompt { get; set; }
    public string? KeyTakeaway { get; set; }
    public ICollection<HuddleTopicRole> TopicRoles { get; set; } = new List<HuddleTopicRole>();
    public ICollection<HuddleTopicMcemStage> McemStages { get; set; } = new List<HuddleTopicMcemStage>();
    public ICollection<HuddlePhase> Phases { get; set; } = new List<HuddlePhase>();
    public ICollection<HuddleActivity> Activities { get; set; } = new List<HuddleActivity>();
    public ICollection<HuddleTopicAgent> TopicAgents { get; set; } = new List<HuddleTopicAgent>();
    public ICollection<HuddleTopicResource> TopicResources { get; set; } = new List<HuddleTopicResource>();
    public HuddleFacilitatorGuide? FacilitatorGuide { get; set; }
}
