//Junction entity that connects activities with one or more AI tools and identifies primary and secondary tools.
namespace AitoWorkflowAndHuddleGenerator.Domain.Entities;

/// <summary>
/// Represents the Activity Ai Tool model.
/// </summary>
public sealed class ActivityAiTool
{
    public int ActivityId { get; set; }

    public Activity Activity { get; set; } = null!;

    public int AiToolId { get; set; }

    public AiTool AiTool { get; set; } = null!;

    public int SortOrder { get; set; }

    public bool IsPrimary { get; set; }
}

/*This creates the many-to-many relationship:

Activity ← ActivityAiTool → AiTool

IsPrimary supports primary and secondary tool display.*/