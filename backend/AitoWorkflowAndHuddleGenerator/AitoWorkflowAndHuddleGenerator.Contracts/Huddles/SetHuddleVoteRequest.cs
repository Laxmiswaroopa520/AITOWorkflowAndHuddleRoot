namespace AitoWorkflowAndHuddleGenerator.Contracts.Huddles;

/// <summary>
/// Represents the Set Huddle Vote Request API contract.
/// </summary>
public sealed record SetHuddleVoteRequest(
    int Value,
    IReadOnlyList<string>? DownvoteReasons,
    string? Comment);
