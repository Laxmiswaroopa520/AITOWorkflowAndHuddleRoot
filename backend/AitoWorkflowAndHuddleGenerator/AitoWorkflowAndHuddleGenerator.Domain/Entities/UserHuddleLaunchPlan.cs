using AitoWorkflowAndHuddleGenerator.Domain.Common;

namespace AitoWorkflowAndHuddleGenerator.Domain.Entities;

/// <summary>Represents the authenticated user's Frontier Accelerator launch plan.</summary>
public sealed class UserHuddleLaunchPlan : AuditableEntity<Guid>
{
    public string OwnerObjectId { get; set; } = string.Empty;
    public string TeamName { get; set; } = string.Empty;
    public string CohortName { get; set; } = string.Empty;
    public DateOnly StartDate { get; set; }
    public DateOnly? EndDate { get; set; }
    public string SponsorName { get; set; } = string.Empty;
    public string Managers { get; set; } = string.Empty;
    public string Facilitators { get; set; } = string.Empty;
    public string ProgramLead { get; set; } = string.Empty;
    public string TaskStateJson { get; set; } = "{}";
    public byte[] RowVersion { get; set; } = [];
}
