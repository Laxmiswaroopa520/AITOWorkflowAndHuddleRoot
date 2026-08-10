using AitoWorkflowAndHuddleGenerator.Domain.Common;
using AitoWorkflowAndHuddleGenerator.Domain.Enums;

namespace AitoWorkflowAndHuddleGenerator.Domain.Entities;

public sealed class HuddleVote : AuditableEntity<Guid>
{
    public string OwnerObjectId { get; set; } = string.Empty;
    public int HuddleTopicId { get; set; }
    public HuddleTopic HuddleTopic { get; set; } = null!;
    public HuddleVoteValue Value { get; set; }
    public string? DownvoteReasons { get; set; }
    public string? Comment { get; set; }
}
