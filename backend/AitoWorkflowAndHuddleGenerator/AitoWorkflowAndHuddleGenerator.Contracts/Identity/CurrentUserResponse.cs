namespace AitoWorkflowAndHuddleGenerator.Contracts.Identity;

/// <summary>
/// Represents the Current User Response API contract.
/// </summary>
public sealed record CurrentUserResponse(
    string ObjectId,
    string? Email,
    string? DisplayName,
    IReadOnlyCollection<string> Roles,
    bool IsAuthenticated);