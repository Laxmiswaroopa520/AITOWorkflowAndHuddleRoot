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

/// <summary>
/// Handles the Get Current User query.
/// </summary>
public sealed class GetCurrentUserQueryHandler
    : IRequestHandler<
        GetCurrentUserQuery,
        CurrentUserResponse>
{
    private readonly ICurrentUserService currentUserService;

    public GetCurrentUserQueryHandler(
        ICurrentUserService currentUserService)
    {
        this.currentUserService = currentUserService;
    }

    /// <summary>
    /// Handles the request through the application pipeline.
    /// </summary>

    public Task<CurrentUserResponse> Handle(
        GetCurrentUserQuery request,
        CancellationToken cancellationToken)
    {
        //checks whether the user is authenticated.if not throws an unauthorized exception.
        if (!currentUserService.IsAuthenticated)
        {
            throw new UnauthorizedAccessException(
                AuthenticationMessages.RequestNotAuthenticated);
        }
        //gets the user's entra id
        string objectId =
            currentUserService.ObjectId
            ?? throw new UnauthorizedAccessException(
                AuthenticationMessages.MissingObjectIdClaim);

        var response = new CurrentUserResponse(
            ObjectId: objectId,
            Email: currentUserService.Email,
            DisplayName: currentUserService.DisplayName,
            Roles: currentUserService.Roles,
            IsAuthenticated:
                currentUserService.IsAuthenticated);

        return Task.FromResult(response);
    }
}