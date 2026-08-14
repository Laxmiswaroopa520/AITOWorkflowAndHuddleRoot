namespace AitoWorkflowAndHuddleGenerator
    .Contracts
    .Workflows;

/// <summary>
/// Represents the Toggle Favorite Request API contract.
/// </summary>
public sealed record ToggleFavoriteRequest(
    bool IsFavorite,
    string RowVersion);