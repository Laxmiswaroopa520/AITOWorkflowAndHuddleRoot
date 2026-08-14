namespace AitoWorkflowAndHuddleGenerator.Domain.Entities;

/// <summary>
/// Represents the User Huddle Plan Item model.
/// </summary>
public sealed class UserHuddlePlanItem
{
    public Guid UserHuddlePlanId { get; set; }
    public UserHuddlePlan UserHuddlePlan { get; set; } = null!;
    public int WeekPosition { get; set; }
    public int HuddleTopicId { get; set; }
    public HuddleTopic HuddleTopic { get; set; } = null!;
}
