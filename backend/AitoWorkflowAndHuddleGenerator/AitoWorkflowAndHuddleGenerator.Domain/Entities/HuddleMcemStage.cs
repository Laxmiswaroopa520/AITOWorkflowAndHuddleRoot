using AitoWorkflowAndHuddleGenerator.Domain.Common;

namespace AitoWorkflowAndHuddleGenerator.Domain.Entities;

/// <summary>
/// Represents the Huddle Mcem Stage model.
/// </summary>
public sealed class HuddleMcemStage : AuditableEntity<int>
{
    public string ExternalId { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
}
