using AitoWorkflowAndHuddleGenerator.Domain.Common;

namespace AitoWorkflowAndHuddleGenerator.Domain.Entities;

/// <summary>
/// Represents the Huddle Facilitator Guide model.
/// </summary>
public sealed class HuddleFacilitatorGuide : AuditableEntity<int>
{
    public string ExternalId { get; set; } = string.Empty;
    public int HuddleTopicId { get; set; }
    public HuddleTopic HuddleTopic { get; set; } = null!;

    /// <summary>
    /// Owning placement. Nullable so the existing one-guide-per-topic rows keep working;
    /// V4 content supplies one guide per placement.
    /// </summary>
    public int? HuddlePlacementId { get; set; }

    public HuddlePlacement? HuddlePlacement { get; set; }
    public string? SessionIntroduction { get; set; }
    public string? KeyTalkingPoints { get; set; }
    public string? DiscussionQuestions { get; set; }
    public string? SuggestedTransitions { get; set; }
    public string? WrapUpGuidance { get; set; }

    /// <summary>What participants should bring, from the Preparation phase.</summary>
    public string? PreparationChecklist { get; set; }

    /// <summary>Questions the facilitator asks during Explore and Practice.</summary>
    public string? FacilitatorQuestions { get; set; }

    /// <summary>Signals the facilitator should listen for while the team practises.</summary>
    public string? ListenFor { get; set; }

    /// <summary>What to do when the practice stalls or the tool is unavailable.</summary>
    public string? FallbackGuidance { get; set; }

    /// <summary>Reflection question for Commit to Action.</summary>
    public string? ReflectPrompt { get; set; }

    /// <summary>Role-aware commitment for Commit to Action.</summary>
    public string? CommitPrompt { get; set; }

    /// <summary>Evidence of progress to bring to the next Huddle.</summary>
    public string? BringBackEvidence { get; set; }
}
