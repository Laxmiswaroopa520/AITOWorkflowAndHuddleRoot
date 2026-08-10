namespace AitoWorkflowAndHuddleGenerator.Domain.Entities;

public sealed class HuddleTopicResource
{
    public int HuddleTopicId { get; set; }
    public HuddleTopic HuddleTopic { get; set; } = null!;
    public int HuddleResourceId { get; set; }
    public HuddleResource HuddleResource { get; set; } = null!;
    public int DisplayOrder { get; set; }
}
