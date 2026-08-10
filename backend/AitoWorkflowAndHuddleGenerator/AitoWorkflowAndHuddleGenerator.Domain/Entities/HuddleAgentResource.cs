namespace AitoWorkflowAndHuddleGenerator.Domain.Entities;

public sealed class HuddleAgentResource
{
    public int HuddleAgentId { get; set; }
    public HuddleAgent HuddleAgent { get; set; } = null!;
    public int HuddleResourceId { get; set; }
    public HuddleResource HuddleResource { get; set; } = null!;
    public int DisplayOrder { get; set; }
}
