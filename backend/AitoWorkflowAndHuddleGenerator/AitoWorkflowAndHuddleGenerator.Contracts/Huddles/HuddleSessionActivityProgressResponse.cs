namespace AitoWorkflowAndHuddleGenerator.Contracts.Huddles;

/// <summary>
/// Represents the Huddle Session Activity Progress Response API contract.
/// </summary>
public sealed record HuddleSessionActivityProgressResponse(
    string ActivityExternalId,
    bool IsCompleted,
    DateTimeOffset? CompletedAtUtc);
