using AitoWorkflowAndHuddleGenerator.Domain.Common;

namespace AitoWorkflowAndHuddleGenerator.Domain.Entities;

public sealed class UserHuddleSession : AuditableEntity<Guid>
{
    public string OwnerObjectId { get; set; } = string.Empty;
    public int HuddleTopicId { get; set; }
    public HuddleTopic HuddleTopic { get; set; } = null!;
    public int? CurrentHuddlePhaseId { get; set; }
    public HuddlePhase? CurrentHuddlePhase { get; set; }
    public string? Notes { get; set; }
    public DateTimeOffset? CompletedAtUtc { get; set; }
    public byte[] RowVersion { get; set; } = [];
    public ICollection<UserHuddleActivityProgress> ActivityProgress { get; set; } = new List<UserHuddleActivityProgress>();
}
