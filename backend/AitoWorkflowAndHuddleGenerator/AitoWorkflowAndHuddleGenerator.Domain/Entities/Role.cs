//Stores application roles, abbreviations, segments, descriptions, sort order, and active status.
using AitoWorkflowAndHuddleGenerator.Domain.Common;

namespace AitoWorkflowAndHuddleGenerator.Domain.Entities;

/// <summary>
/// Represents the Role model.
/// </summary>
public sealed class Role : AuditableEntity<int>
{
    public string ExternalId { get; set; } = string.Empty;

    public string Name { get; set; } = string.Empty;

    public string Abbreviation { get; set; } = string.Empty;

    public string? Segment { get; set; }

    public string? Description { get; set; }

    public int SortOrder { get; set; }

    public bool IsActive { get; set; } = true;

    public ICollection<Activity> Activities { get; set; } =
        new List<Activity>();
}
/*ExternalId is the stable identifier used by:

The frontend.
SQL scripts.
SharePoint migration.
QA and production environments.
Relationship lookup without hardcoded identity v*/