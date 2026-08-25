using AitoWorkflowAndHuddleGenerator.Domain.Common;
using AitoWorkflowAndHuddleGenerator.Domain.Enums;

namespace AitoWorkflowAndHuddleGenerator.Domain.Entities;

/// <summary>
/// Represents the User Huddle Session model.
/// </summary>
public sealed class UserHuddleSession : AuditableEntity<Guid>
{
    public string OwnerObjectId { get; set; } = string.Empty;
    public int HuddleTopicId { get; set; }
    public HuddleTopic HuddleTopic { get; set; } = null!;
    public int? CurrentHuddlePhaseId { get; set; }
    public HuddlePhase? CurrentHuddlePhase { get; set; }
    public string? Notes { get; set; }
    public DateTimeOffset StartedAtUtc { get; set; }
    public DateTimeOffset LastSavedAtUtc { get; set; }
    public DateTimeOffset? CompletedAtUtc { get; set; }
    public HuddleSessionStatus SessionStatus { get; set; } = HuddleSessionStatus.InProgress;
    public byte[] RowVersion { get; set; } = [];
    public ICollection<UserHuddleActivityProgress> ActivityProgress { get; set; } = new List<UserHuddleActivityProgress>();
}
