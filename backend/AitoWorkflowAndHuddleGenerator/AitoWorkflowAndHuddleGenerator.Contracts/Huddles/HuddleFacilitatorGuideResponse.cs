namespace AitoWorkflowAndHuddleGenerator.Contracts.Huddles;

/// <summary>
/// Represents the Huddle Facilitator Guide Response API contract.
/// </summary>
public sealed record HuddleFacilitatorGuideResponse(
    string? SessionIntroduction,
    IReadOnlyList<string> KeyTalkingPoints,
    IReadOnlyList<string> DiscussionQuestions,
    IReadOnlyList<string> SuggestedTransitions,
    string? WrapUpGuidance,
    IReadOnlyList<string> PreparationChecklist,
    IReadOnlyList<string> FacilitatorQuestions,
    IReadOnlyList<string> ListenFor,
    string? FallbackGuidance,
    string? ReflectPrompt,
    string? CommitPrompt,
    IReadOnlyList<string> BringBackEvidence);
