namespace AitoWorkflowAndHuddleGenerator.Domain.Entities;

public sealed class HuddleTopicRole
{
    public int HuddleTopicId { get; set; }
    public HuddleTopic HuddleTopic { get; set; } = null!;
    public int RoleId { get; set; }
    public Role Role { get; set; } = null!;
}
