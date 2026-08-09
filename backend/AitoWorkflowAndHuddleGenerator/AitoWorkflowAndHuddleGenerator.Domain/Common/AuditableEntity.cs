//Adds CreatedAtUtc and UpdatedAtUtc fields for tracking record creation and updates.
namespace AitoWorkflowAndHuddleGenerator.Domain.Common;

public abstract class AuditableEntity<TKey> : BaseEntity<TKey>
    where TKey : notnull
{
    public DateTimeOffset CreatedAtUtc { get; set; }

    public DateTimeOffset? UpdatedAtUtc { get; set; }
}


/*Use integer IDs for reference entities:

Role
AiTool
WorkflowBucket
Activity

Use GUID IDs for user-generated records:

UserWorkflow
WorkflowShare

Use composite keys for junction tables:

ActivityAiTool
UserWorkflowActivity*/