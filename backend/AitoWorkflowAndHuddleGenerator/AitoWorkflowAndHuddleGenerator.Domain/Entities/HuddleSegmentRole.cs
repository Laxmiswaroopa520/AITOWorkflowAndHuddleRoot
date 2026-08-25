using AitoWorkflowAndHuddleGenerator.Domain.Common;

namespace AitoWorkflowAndHuddleGenerator.Domain.Entities;

/// <summary>
/// Represents the Huddle Segment Role model.
/// </summary>
public sealed class HuddleSegmentRole : AuditableEntity<int>
{
    public string ExternalId { get; set; } = string.Empty;
    public int HuddleSegmentId { get; set; }
    public HuddleSegment HuddleSegment { get; set; } = null!;
    public int RoleId { get; set; }
    public Role Role { get; set; } = null!;
    public string DisplayName { get; set; } = string.Empty;
    public ICollection<HuddleRolePathItem> PathItems { get; set; } = new List<HuddleRolePathItem>();

    public ICollection<HuddlePlacement> Placements { get; set; } = new List<HuddlePlacement>();
}
