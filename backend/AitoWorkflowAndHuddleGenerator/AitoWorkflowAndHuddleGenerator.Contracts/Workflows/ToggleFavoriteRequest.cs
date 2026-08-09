namespace AitoWorkflowAndHuddleGenerator
    .Contracts
    .Workflows;

public sealed record ToggleFavoriteRequest(
    bool IsFavorite,
    string RowVersion);