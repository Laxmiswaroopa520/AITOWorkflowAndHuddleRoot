using AitoWorkflowAndHuddleGenerator.Domain.Common;

namespace AitoWorkflowAndHuddleGenerator.Domain.Entities;

public sealed class HuddleFocusArea : AuditableEntity<int>
{
    public string ExternalId { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public ICollection<HuddleTopic> Topics { get; set; } = new List<HuddleTopic>();
}
