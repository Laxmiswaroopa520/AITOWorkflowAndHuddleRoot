using AitoWorkflowAndHuddleGenerator.Contracts.Activities;
using MediatR;

namespace AitoWorkflowAndHuddleGenerator
    .Application
    .Features
    .Activities
    .Queries
    .GetActivities;

public sealed record GetActivitiesQuery(
    string? RoleId,
    string? WorkflowBucketId,
    string? AiToolId,
    string? Category,
    string? Frequency,
    string? Priority,
    string? ToolCoverageLevel,
    string? TriggerContext,
    string? McemStage,
    string? Search,
    bool IncludeInactive)
    : IRequest<IReadOnlyList<ActivityResponse>>;