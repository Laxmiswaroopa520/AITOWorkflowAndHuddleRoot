namespace AitoWorkflowAndHuddleGenerator.Domain.Entities;

/// <summary>
/// Represents the Huddle Topic Role model.
/// </summary>
public sealed class HuddleTopicRole
{
    public int HuddleTopicId { get; set; }
    public HuddleTopic HuddleTopic { get; set; } = null!;
    public int RoleId { get; set; }
    public Role Role { get; set; } = null!;
}
