namespace AitoWorkflowAndHuddleGenerator.Contracts.Huddles;

/// <summary>
/// Represents the Huddle Vote Response API contract.
/// </summary>
public sealed record HuddleVoteResponse(
    string HuddleExternalId,
    int Upvotes,
    int Downvotes,
    int? CurrentUserVote);
