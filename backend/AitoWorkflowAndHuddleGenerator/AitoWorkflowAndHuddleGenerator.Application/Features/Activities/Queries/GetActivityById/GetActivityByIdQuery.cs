using AitoWorkflowAndHuddleGenerator.Contracts.Activities;
using MediatR;

namespace AitoWorkflowAndHuddleGenerator
    .Application
    .Features
    .Activities
    .Queries
    .GetActivityById;

public sealed record GetActivityByIdQuery(
    int Id)
    : IRequest<ActivityResponse?>;