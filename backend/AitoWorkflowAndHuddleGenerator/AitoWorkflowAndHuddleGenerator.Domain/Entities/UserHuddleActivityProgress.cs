namespace AitoWorkflowAndHuddleGenerator.Domain.Entities;

/// <summary>
/// Represents the User Huddle Activity Progress model.
/// </summary>
public sealed class UserHuddleActivityProgress
{
    public Guid UserHuddleSessionId { get; set; }
    public UserHuddleSession UserHuddleSession { get; set; } = null!;
    public int HuddleActivityId { get; set; }
    public HuddleActivity HuddleActivity { get; set; } = null!;
    public bool IsCompleted { get; set; }
    public DateTimeOffset? CompletedAtUtc { get; set; }
}
