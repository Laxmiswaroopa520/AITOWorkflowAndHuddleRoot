namespace AitoWorkflowAndHuddleGenerator.Contracts.Huddles;

public sealed record SetHuddleVoteRequest(
    int Value,
    IReadOnlyList<string>? DownvoteReasons,
    string? Comment);
