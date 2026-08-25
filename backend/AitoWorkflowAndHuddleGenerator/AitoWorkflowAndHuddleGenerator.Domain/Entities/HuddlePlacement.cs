using AitoWorkflowAndHuddleGenerator.Domain.Common;

namespace AitoWorkflowAndHuddleGenerator.Domain.Entities;

/// <summary>
/// Represents one appearance of a Huddle topic on one role's path, which the content
/// workbook calls a placement. The same topic reads differently for each role, so the
/// role-facing narrative, the phases, the activities and the facilitator guide all hang
/// off the placement rather than off the topic.
/// </summary>
public sealed class HuddlePlacement : AuditableEntity<int>
{
    /// <summary>Workbook PlacementID, for example AE-CONV.</summary>
    public string ExternalId { get; set; } = string.Empty;

    public int HuddleSegmentRoleId { get; set; }

    public HuddleSegmentRole HuddleSegmentRole { get; set; } = null!;

    public int HuddleTopicId { get; set; }

    public HuddleTopic HuddleTopic { get; set; } = null!;

    /// <summary>
    /// Which part of the role path this placement belongs to, for example SEC-ROLEPATH,
    /// SEC-ORIENTATION or SEC-ADDITIONAL. Sequence numbers restart per section, so this
    /// is part of the natural key.
    /// </summary>
    public string PathSection { get; set; } = string.Empty;

    /// <summary>Position within the path section. Maps to WeekPosition for role-path placements.</summary>
    public int Sequence { get; set; }

    /// <summary>Role-facing title, which differs from the topic name.</summary>
    public string RoleTopicName { get; set; } = string.Empty;

    public string? RoleTopicDescription { get; set; }

    public string? TodayObjective { get; set; }

    /// <summary>What's in it for me: the role-specific reason to attend.</summary>
    public string? Wiifm { get; set; }

    public string? DesiredOutcome { get; set; }

    public bool IsActive { get; set; } = true;

    public ICollection<HuddlePhase> Phases { get; set; } = new List<HuddlePhase>();

    public ICollection<HuddleActivity> Activities { get; set; } = new List<HuddleActivity>();

    public HuddleFacilitatorGuide? FacilitatorGuide { get; set; }
}
