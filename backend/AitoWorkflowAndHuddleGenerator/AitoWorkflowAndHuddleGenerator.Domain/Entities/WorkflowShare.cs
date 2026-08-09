//Stores workflow-sharing details, recipient and sender information, messages, revocation status, and audit history.
using AitoWorkflowAndHuddleGenerator.Domain.Common;

namespace AitoWorkflowAndHuddleGenerator.Domain.Entities;

public sealed class WorkflowShare : AuditableEntity<Guid>
{
    public Guid UserWorkflowId { get; set; }

    public UserWorkflow UserWorkflow { get; set; } = null!;

    public string RecipientObjectId { get; set; } = string.Empty;

    public string RecipientEmail { get; set; } = string.Empty;

    public string RecipientDisplayName { get; set; } = string.Empty;

    public string SharedByObjectId { get; set; } = string.Empty;

    public string SharedByEmail { get; set; } = string.Empty;

    public string SharedByDisplayName { get; set; } = string.Empty;

    public string? Message { get; set; }

    public bool IsRevoked { get; set; }

    public DateTimeOffset? RevokedAtUtc { get; set; }

    public byte[] RowVersion { get; set; } = [];
}