namespace AitoWorkflowAndHuddleGenerator.Contracts.Identity;

public sealed record CurrentUserResponse(
    string ObjectId,
    string? Email,
    string? DisplayName,
    IReadOnlyCollection<string> Roles,
    bool IsAuthenticated);