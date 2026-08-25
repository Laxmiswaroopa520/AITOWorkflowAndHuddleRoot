using AitoWorkflowAndHuddleGenerator.Contracts.Identity;
using MediatR;

namespace AitoWorkflowAndHuddleGenerator
    .Application
    .Features
    .Identity
    .Queries
    .GetCurrentUser;

/// <summary>
/// Represents the Get Current User Query query.
/// </summary>
public sealed record GetCurrentUserQuery
    : IRequest<CurrentUserResponse>;