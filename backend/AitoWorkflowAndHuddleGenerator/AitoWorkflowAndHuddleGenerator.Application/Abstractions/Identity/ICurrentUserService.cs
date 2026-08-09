namespace AitoWorkflowAndHuddleGenerator
    .Application
    .Abstractions
    .Identity;

public interface ICurrentUserService
{
    bool IsAuthenticated { get; }

    string? ObjectId { get; }

    string? Email { get; }

    string? DisplayName { get; }

    IReadOnlyCollection<string> Roles { get; }
}