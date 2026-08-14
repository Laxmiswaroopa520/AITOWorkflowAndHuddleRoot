using AitoWorkflowAndHuddleGenerator.Domain.Common;

namespace AitoWorkflowAndHuddleGenerator.Domain.Entities;

/// <summary>
/// Represents the Huddle Focus Area model.
/// </summary>
public sealed class HuddleFocusArea : AuditableEntity<int>
{
    public string ExternalId { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public ICollection<HuddleTopic> Topics { get; set; } = new List<HuddleTopic>();
}
