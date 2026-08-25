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

    /// <summary>
    /// MCEM stage number, 1 through 5. Stored rather than parsed out of the ExternalId.
    /// Nullable because pre-V4 rows were seeded without it.
    /// </summary>
    public int? StageNumber { get; set; }
}
