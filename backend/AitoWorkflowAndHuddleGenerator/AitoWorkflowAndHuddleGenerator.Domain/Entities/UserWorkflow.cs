//Stores workflows created and saved by users, including ownership, role, duration, favorite status, and concurrency information.
using AitoWorkflowAndHuddleGenerator.Domain.Common;

namespace AitoWorkflowAndHuddleGenerator.Domain.Entities;

/// <summary>
/// Represents the User Workflow model.
/// </summary>
public sealed class UserWorkflow : AuditableEntity<Guid>
{
    public string Name { get; set; } = string.Empty;

    public string? Description { get; set; }

    public string OwnerObjectId { get; set; } = string.Empty;

    public string OwnerEmail { get; set; } = string.Empty;

    public string OwnerDisplayName { get; set; } = string.Empty;

    public int RoleId { get; set; }

    public Role Role { get; set; } = null!;

    public int TotalDurationMinutes { get; set; }

    public bool IsFavorite { get; set; }

    public byte[] RowVersion { get; set; } = [];

    public ICollection<UserWorkflowActivity> UserWorkflowActivities
    { get; set; } = new List<UserWorkflowActivity>();

    public ICollection<WorkflowShare> WorkflowShares { get; set; } =
        new List<WorkflowShare>();
}