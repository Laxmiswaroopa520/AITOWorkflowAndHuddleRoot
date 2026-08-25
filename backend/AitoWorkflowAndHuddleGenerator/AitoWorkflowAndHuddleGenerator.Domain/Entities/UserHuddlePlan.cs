using AitoWorkflowAndHuddleGenerator.Domain.Common;

namespace AitoWorkflowAndHuddleGenerator.Domain.Entities;

/// <summary>
/// Represents the User Huddle Plan model.
/// </summary>
public sealed class UserHuddlePlan : AuditableEntity<Guid>
{
    public string OwnerObjectId { get; set; } = string.Empty;
    public int HuddleSegmentRoleId { get; set; }
    public HuddleSegmentRole HuddleSegmentRole { get; set; } = null!;
    public string Name { get; set; } = string.Empty;
    public byte[] RowVersion { get; set; } = [];
    public ICollection<UserHuddlePlanItem> Items { get; set; } = new List<UserHuddlePlanItem>();
}
