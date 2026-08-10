using AitoWorkflowAndHuddleGenerator.Domain.Common;

namespace AitoWorkflowAndHuddleGenerator.Domain.Entities;

public sealed class HuddleSegment : AuditableEntity<int>
{
    public string ExternalId { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public ICollection<HuddleSegmentRole> SegmentRoles { get; set; } = new List<HuddleSegmentRole>();
}
