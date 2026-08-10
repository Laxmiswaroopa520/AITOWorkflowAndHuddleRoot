using AitoWorkflowAndHuddleGenerator.Domain.Enums;

namespace AitoWorkflowAndHuddleGenerator.Domain.Entities;

public sealed class HuddleTopicAgent
{
    public int HuddleTopicId { get; set; }
    public HuddleTopic HuddleTopic { get; set; } = null!;
    public int HuddleAgentId { get; set; }
    public HuddleAgent HuddleAgent { get; set; } = null!;
    public HuddleAgentUsageType UsageType { get; set; }
    public string? DisplayLabel { get; set; }
    public bool ShowAgentAccessLink { get; set; }
    public int DisplayOrder { get; set; }
}
