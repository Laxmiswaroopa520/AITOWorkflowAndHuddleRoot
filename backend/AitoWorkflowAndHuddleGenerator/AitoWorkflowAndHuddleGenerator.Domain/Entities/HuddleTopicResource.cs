namespace AitoWorkflowAndHuddleGenerator.Domain.Entities;

/// <summary>
/// Represents the Huddle Topic Resource model.
/// </summary>
public sealed class HuddleTopicResource
{
    public int HuddleTopicId { get; set; }
    public HuddleTopic HuddleTopic { get; set; } = null!;
    public int HuddleResourceId { get; set; }
    public HuddleResource HuddleResource { get; set; } = null!;
    public int DisplayOrder { get; set; }
}
