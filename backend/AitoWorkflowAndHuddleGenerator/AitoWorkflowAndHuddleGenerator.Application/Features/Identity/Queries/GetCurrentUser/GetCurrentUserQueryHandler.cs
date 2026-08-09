using AitoWorkflowAndHuddleGenerator
    .Application
    .Abstractions
    .Identity;
using AitoWorkflowAndHuddleGenerator.Contracts.Identity;
using MediatR;

namespace AitoWorkflowAndHuddleGenerator
    .Application
    .Features
    .Identity
    .Queries
    .GetCurrentUser;

public sealed class GetCurrentUserQueryHandler
    : IRequestHandler<
        GetCurrentUserQuery,
        CurrentUserResponse>
{
    private readonly ICurrentUserService _currentUserService;

    public GetCurrentUserQueryHandler(
        ICurrentUserService currentUserService)
    {
        _currentUserService = currentUserService;
    }

    public Task<CurrentUserResponse> Handle(
        GetCurrentUserQuery request,
        CancellationToken cancellationToken)
    {
        if (!_currentUserService.IsAuthenticated)
        {
            throw new UnauthorizedAccessException(
                "The current request is not authenticated.");
        }

        string objectId =
            _currentUserService.ObjectId
            ?? throw new UnauthorizedAccessException(
                "The authenticated token does not contain an oid claim.");

        var response = new CurrentUserResponse(
            ObjectId: objectId,
            Email: _currentUserService.Email,
            DisplayName: _currentUserService.DisplayName,
            Roles: _currentUserService.Roles,
            IsAuthenticated:
                _currentUserService.IsAuthenticated);

        return Task.FromResult(response);
    }
}