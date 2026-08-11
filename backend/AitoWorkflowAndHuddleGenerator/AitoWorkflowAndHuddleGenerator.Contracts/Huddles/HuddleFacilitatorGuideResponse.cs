namespace AitoWorkflowAndHuddleGenerator.Contracts.Huddles;

public sealed record HuddleFacilitatorGuideResponse(string? SessionIntroduction, IReadOnlyList<string> KeyTalkingPoints, IReadOnlyList<string> DiscussionQuestions, IReadOnlyList<string> SuggestedTransitions, string? WrapUpGuidance);
