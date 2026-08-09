//Junction entity that stores the activities selected within a saved user workflow and their display order.
namespace AitoWorkflowAndHuddleGenerator.Domain.Entities;

public sealed class UserWorkflowActivity
{
    public Guid UserWorkflowId { get; set; }

    public UserWorkflow UserWorkflow { get; set; } = null!;

    public int ActivityId { get; set; }

    public Activity Activity { get; set; } = null!;

    public int SortOrder { get; set; }

    public DateTimeOffset AddedAtUtc { get; set; }
}

/*This replaces the earlier JSON activity array approach.

Instead of:

ActivityIdsJson

SQL will store one row for each workflow activity.*/