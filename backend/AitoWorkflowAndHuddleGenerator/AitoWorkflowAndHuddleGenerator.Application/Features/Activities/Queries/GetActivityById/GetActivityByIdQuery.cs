using AitoWorkflowAndHuddleGenerator.Contracts.Activities;
using MediatR;

namespace AitoWorkflowAndHuddleGenerator
    .Application
    .Features
    .Activities
    .Queries
    .GetActivityById;

/// <summary>
/// Represents the Get Activity By Id Query query.
/// </summary>
public sealed record GetActivityByIdQuery(
    int Id)
    : IRequest<ActivityResponse?>;