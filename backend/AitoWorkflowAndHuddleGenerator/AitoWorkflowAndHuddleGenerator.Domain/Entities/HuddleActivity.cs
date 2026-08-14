using AitoWorkflowAndHuddleGenerator.Domain.Common;

namespace AitoWorkflowAndHuddleGenerator.Domain.Entities;

/// <summary>
/// Represents the Huddle Activity model.
/// </summary>
public sealed class HuddleActivity : AuditableEntity<int>
{
    public string ExternalId { get; set; } = string.Empty;
    public int HuddleTopicId { get; set; }
    public HuddleTopic HuddleTopic { get; set; } = null!;
    public int HuddlePhaseId { get; set; }
    public HuddlePhase HuddlePhase { get; set; } = null!;
    public int DisplayOrder { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int? DurationMinutes { get; set; }
    public string? Prompt { get; set; }
    public string? ExpectedOutput { get; set; }
    public string? HumanCheckpoint { get; set; }
    public string? RequiredContext { get; set; }
    public string? BestFitJob { get; set; }
    public ICollection<HuddleActivityAgent> ActivityAgents { get; set; } = new List<HuddleActivityAgent>();
    public ICollection<HuddleActivityResource> ActivityResources { get; set; } = new List<HuddleActivityResource>();
}
