using AitoWorkflowAndHuddleGenerator.Domain.Common;

namespace AitoWorkflowAndHuddleGenerator.Domain.Entities;

/// <summary>
/// Represents the Huddle Phase model.
/// </summary>
public sealed class HuddlePhase : AuditableEntity<int>
{
    public string ExternalId { get; set; } = string.Empty;
    public int HuddleTopicId { get; set; }
    public HuddleTopic HuddleTopic { get; set; } = null!;
    public int DisplayOrder { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int? DurationMinutes { get; set; }
    public ICollection<HuddleActivity> Activities { get; set; } = new List<HuddleActivity>();
}
