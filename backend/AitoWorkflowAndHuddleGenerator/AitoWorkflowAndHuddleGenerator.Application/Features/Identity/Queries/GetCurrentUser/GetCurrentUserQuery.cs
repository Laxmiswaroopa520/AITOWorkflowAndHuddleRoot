using AitoWorkflowAndHuddleGenerator.Contracts.Identity;
using MediatR;

namespace AitoWorkflowAndHuddleGenerator
    .Application
    .Features
    .Identity
    .Queries
    .GetCurrentUser;

public sealed record GetCurrentUserQuery
    : IRequest<CurrentUserResponse>;