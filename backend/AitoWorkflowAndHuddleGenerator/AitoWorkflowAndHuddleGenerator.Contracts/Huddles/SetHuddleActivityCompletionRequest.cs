namespace AitoWorkflowAndHuddleGenerator.Contracts.Huddles;

public sealed record SetHuddleActivityCompletionRequest(bool IsCompleted, string RowVersion);
