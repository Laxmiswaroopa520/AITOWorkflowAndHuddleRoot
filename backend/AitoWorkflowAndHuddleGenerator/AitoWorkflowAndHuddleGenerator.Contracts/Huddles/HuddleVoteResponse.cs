namespace AitoWorkflowAndHuddleGenerator.Contracts.Huddles;

public sealed record HuddleVoteResponse(
    string HuddleExternalId,
    int Upvotes,
    int Downvotes,
    int? CurrentUserVote);
