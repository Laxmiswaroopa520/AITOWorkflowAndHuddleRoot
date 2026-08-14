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
    public string? SessionIntroduction { get; set; }
    public string? KeyTalkingPoints { get; set; }
    public string? DiscussionQuestions { get; set; }
    public string? SuggestedTransitions { get; set; }
    public string? WrapUpGuidance { get; set; }
}
