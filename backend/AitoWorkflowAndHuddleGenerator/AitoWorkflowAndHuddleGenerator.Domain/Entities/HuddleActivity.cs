using AitoWorkflowAndHuddleGenerator.Domain.Common;
using AitoWorkflowAndHuddleGenerator.Domain.Enums;

namespace AitoWorkflowAndHuddleGenerator.Domain.Entities;

/// <summary>
/// Represents the Huddle Activity model.
/// </summary>
public sealed class HuddleActivity : AuditableEntity<int>
{
    public string ExternalId { get; set; } = string.Empty;
    public int HuddleTopicId { get; set; }
    public HuddleTopic HuddleTopic { get; set; } = null!;

    /// <summary>
    /// Owning placement. Nullable so pre-V4 rows, which were only topic-scoped, keep
    /// working. V4 content always sets it.
    /// </summary>
    public int? HuddlePlacementId { get; set; }

    public HuddlePlacement? HuddlePlacement { get; set; }
    public int HuddlePhaseId { get; set; }
    public HuddlePhase HuddlePhase { get; set; } = null!;
    public int DisplayOrder { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int? DurationMinutes { get; set; }
    public string? Prompt { get; set; }
    public string? ExpectedOutput { get; set; }
    public string? HumanCheckpoint { get; set; }
    public string? RequiredContext { get; set; }
    public string? BestFitJob { get; set; }

    /// <summary>Whether this is a priority practice or a deeper follow-on one.</summary>
    public HuddlePracticeTier PracticeTier { get; set; } = HuddlePracticeTier.Featured;

    /// <summary>How the activity is run: prompt, click-through steps, or both.</summary>
    public HuddleActivityExecutionMethod ExecutionMethod { get; set; } = HuddleActivityExecutionMethod.Prompt;

    /// <summary>Newline-separated numbered steps, one step per line.</summary>
    public string? ActivitySteps { get; set; }

    public string? WhyThisMatters { get; set; }

    /// <summary>Entry point for the agent or tool. Blank when nothing is published.</summary>
    public string? LaunchUrl { get; set; }

    public string? LaunchLabel { get; set; }

    /// <summary>
    /// Activity whose output this one consumes. Always within the same placement, so an
    /// Extended practice can point at the Featured one it builds on.
    /// </summary>
    public int? PrerequisiteHuddleActivityId { get; set; }

    public HuddleActivity? PrerequisiteHuddleActivity { get; set; }

    /// <summary>Activities that consume this one's output.</summary>
    public ICollection<HuddleActivity> DependentActivities { get; set; } = new List<HuddleActivity>();
    public ICollection<HuddleActivityAgent> ActivityAgents { get; set; } = new List<HuddleActivityAgent>();
    public ICollection<HuddleActivityResource> ActivityResources { get; set; } = new List<HuddleActivityResource>();
}
