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

    /// <summary>
    /// Which placement of the topic this week uses. A role path can hold the same topic in two
    /// weeks, for example AE weeks 3 and 4 are both WF-X-PIPE-01, so the topic alone cannot say
    /// which content the week should open. Nullable for plans saved before this column existed.
    /// </summary>
    public int? HuddlePlacementId { get; set; }

    /// <summary>The placement this week uses.</summary>
    public HuddlePlacement? HuddlePlacement { get; set; }
}
