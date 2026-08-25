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

    /// <summary>
    /// Owning placement. Nullable so pre-V4 topic-scoped phases keep working; V4 content
    /// creates one Preparation, Explore and Practice, and Commit to Action phase per placement.
    /// </summary>
    public int? HuddlePlacementId { get; set; }

    public HuddlePlacement? HuddlePlacement { get; set; }
    public int DisplayOrder { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int? DurationMinutes { get; set; }
    public ICollection<HuddleActivity> Activities { get; set; } = new List<HuddleActivity>();
}
