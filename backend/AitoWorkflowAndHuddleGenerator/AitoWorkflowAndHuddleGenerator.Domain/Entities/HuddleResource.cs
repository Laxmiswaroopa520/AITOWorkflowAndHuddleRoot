using AitoWorkflowAndHuddleGenerator.Domain.Common;

namespace AitoWorkflowAndHuddleGenerator.Domain.Entities;

/// <summary>
/// Represents the Huddle Resource model.
/// </summary>
public sealed class HuddleResource : AuditableEntity<int>
{
    public string ExternalId { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Url { get; set; }

    public string? Type { get; set; }
    public string? LinkLabel { get; set; }
}
