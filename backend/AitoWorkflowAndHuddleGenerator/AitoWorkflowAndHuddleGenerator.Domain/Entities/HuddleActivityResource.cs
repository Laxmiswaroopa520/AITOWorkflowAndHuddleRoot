namespace AitoWorkflowAndHuddleGenerator.Domain.Entities;

/// <summary>
/// Represents the Huddle Activity Resource model.
/// </summary>
public sealed class HuddleActivityResource
{
    public int HuddleActivityId { get; set; }
    public HuddleActivity HuddleActivity { get; set; } = null!;
    public int HuddleResourceId { get; set; }
    public HuddleResource HuddleResource { get; set; } = null!;
    public int DisplayOrder { get; set; }
}
