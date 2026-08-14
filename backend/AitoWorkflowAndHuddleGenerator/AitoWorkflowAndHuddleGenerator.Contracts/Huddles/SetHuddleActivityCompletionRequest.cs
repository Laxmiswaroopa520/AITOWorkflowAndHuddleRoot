namespace AitoWorkflowAndHuddleGenerator.Contracts.Huddles;

/// <summary>
/// Represents the Set Huddle Activity Completion Request API contract.
/// </summary>
public sealed record SetHuddleActivityCompletionRequest(bool IsCompleted, string RowVersion);
