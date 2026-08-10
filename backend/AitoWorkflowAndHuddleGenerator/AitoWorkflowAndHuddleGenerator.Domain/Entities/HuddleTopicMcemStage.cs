namespace AitoWorkflowAndHuddleGenerator.Domain.Entities;

public sealed class HuddleTopicMcemStage
{
    public int HuddleTopicId { get; set; }
    public HuddleTopic HuddleTopic { get; set; } = null!;
    public int HuddleMcemStageId { get; set; }
    public HuddleMcemStage HuddleMcemStage { get; set; } = null!;
    public int DisplayOrder { get; set; }
}
