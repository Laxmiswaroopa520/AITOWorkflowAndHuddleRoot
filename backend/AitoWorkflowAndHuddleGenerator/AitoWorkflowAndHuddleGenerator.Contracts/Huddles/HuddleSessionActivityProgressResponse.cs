namespace AitoWorkflowAndHuddleGenerator.Contracts.Huddles;

public sealed record HuddleSessionActivityProgressResponse(
    string ActivityExternalId,
    bool IsCompleted,
    DateTimeOffset? CompletedAtUtc);
