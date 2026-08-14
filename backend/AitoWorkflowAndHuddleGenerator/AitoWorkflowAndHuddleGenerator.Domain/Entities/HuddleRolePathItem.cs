namespace AitoWorkflowAndHuddleGenerator.Domain.Entities;

/// <summary>
/// Represents the Huddle Role Path Item model.
/// </summary>
public sealed class HuddleRolePathItem
{
    public int HuddleSegmentRoleId { get; set; }
    public HuddleSegmentRole HuddleSegmentRole { get; set; } = null!;
    public int WeekPosition { get; set; }
    public int HuddleTopicId { get; set; }
    public HuddleTopic HuddleTopic { get; set; } = null!;
}
