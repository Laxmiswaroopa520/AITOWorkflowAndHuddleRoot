namespace AitoWorkflowAndHuddleGenerator.Domain.Entities;

public sealed class UserHuddleActivityProgress
{
    public Guid UserHuddleSessionId { get; set; }
    public UserHuddleSession UserHuddleSession { get; set; } = null!;
    public int HuddleActivityId { get; set; }
    public HuddleActivity HuddleActivity { get; set; } = null!;
    public bool IsCompleted { get; set; }
    public DateTimeOffset? CompletedAtUtc { get; set; }
}
