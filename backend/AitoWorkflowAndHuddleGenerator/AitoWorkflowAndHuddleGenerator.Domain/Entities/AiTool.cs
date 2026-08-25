//Stores AI tool details such as name, description, color, icon key, sort order, and active status.
using AitoWorkflowAndHuddleGenerator.Domain.Common;

namespace AitoWorkflowAndHuddleGenerator.Domain.Entities;

/// <summary>
/// Represents the Ai Tool model.
/// </summary>
public sealed class AiTool : AuditableEntity<int>
{
    public string ExternalId { get; set; } = string.Empty;

    public string Name { get; set; } = string.Empty;

    public string? Description { get; set; }

    public string? Color { get; set; }

    public string? IconKey { get; set; }

    public int SortOrder { get; set; }

    public bool IsActive { get; set; } = true;

    public ICollection<ActivityAiTool> ActivityAiTools { get; set; } =
        new List<ActivityAiTool>();
}
/*IconKey stores a logical key:

copilot
j-ai
sales-agent*/