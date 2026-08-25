//Stores workflow grouping categories used to organize activities.
using AitoWorkflowAndHuddleGenerator.Domain.Common;

namespace AitoWorkflowAndHuddleGenerator.Domain.Entities;

/// <summary>
/// Represents the Workflow Bucket model.
/// </summary>
public sealed class WorkflowBucket : AuditableEntity<int>
{
    public string ExternalId { get; set; } = string.Empty;

    public string Name { get; set; } = string.Empty;

    public string? Description { get; set; }

    public int SortOrder { get; set; }

    public bool IsActive { get; set; } = true;

    public ICollection<Activity> Activities { get; set; } =
        new List<Activity>();
}