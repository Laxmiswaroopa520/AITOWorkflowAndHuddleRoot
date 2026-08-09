using AitoWorkflowAndHuddleGenerator
    .Application
    .Abstractions
    .Persistence;
using AitoWorkflowAndHuddleGenerator
    .Application
    .Features
    .Activities
    .Common;
using AitoWorkflowAndHuddleGenerator.Contracts.Activities;
using AitoWorkflowAndHuddleGenerator.Domain.Entities;
using AitoWorkflowAndHuddleGenerator.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AitoWorkflowAndHuddleGenerator
    .Application
    .Features
    .Activities
    .Queries
    .GetActivities;

public sealed class GetActivitiesQueryHandler
    : IRequestHandler<
        GetActivitiesQuery,
        IReadOnlyList<ActivityResponse>>
{
    private readonly IApplicationDbContext _dbContext;

    public GetActivitiesQueryHandler(
        IApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<
        IReadOnlyList<ActivityResponse>> Handle(
            GetActivitiesQuery request,
            CancellationToken cancellationToken)
    {
        IQueryable<Activity> query =
            _dbContext.Activities
                .AsNoTracking();

        if (!request.IncludeInactive)
        {
            query = query.Where(
                activity => activity.IsActive);
        }

        if (!string.IsNullOrWhiteSpace(request.RoleId))
        {
            string roleId = request.RoleId.Trim();

            query = query.Where(
                activity =>
                    activity.Role.ExternalId == roleId);
        }

        if (!string.IsNullOrWhiteSpace(
                request.WorkflowBucketId))
        {
            string bucketId =
                request.WorkflowBucketId.Trim();

            query = query.Where(
                activity =>
                    activity.WorkflowBucket.ExternalId ==
                    bucketId);
        }

        if (!string.IsNullOrWhiteSpace(
                request.AiToolId))
        {
            string aiToolId =
                request.AiToolId.Trim();

            query = query.Where(
                activity =>
                    activity.ActivityAiTools.Any(
                        mapping =>
                            mapping.AiTool.ExternalId ==
                            aiToolId));
        }

        if (TryParseEnum(
                request.Category,
                out ActivityCategory category))
        {
            query = query.Where(
                activity =>
                    activity.Category == category);
        }

        if (TryParseEnum(
                request.Frequency,
                out ActivityFrequency frequency))
        {
            query = query.Where(
                activity =>
                    activity.Frequency == frequency);
        }

        if (TryParseEnum(
                request.Priority,
                out ActivityPriority priority))
        {
            query = query.Where(
                activity =>
                    activity.Priority == priority);
        }

        if (TryParseEnum(
                request.ToolCoverageLevel,
                out ToolCoverageLevel coverageLevel))
        {
            query = query.Where(
                activity =>
                    activity.ToolCoverageLevel ==
                    coverageLevel);
        }

        if (TryParseEnum(
                request.TriggerContext,
                out TriggerContext triggerContext))
        {
            query = query.Where(
                activity =>
                    activity.TriggerContext ==
                    triggerContext);
        }

        if (TryParseEnum(
                request.McemStage,
                out McemStage mcemStage))
        {
            query = query.Where(
                activity =>
                    activity.McemStage == mcemStage);
        }

        if (!string.IsNullOrWhiteSpace(
                request.Search))
        {
            string searchTerm =
                request.Search.Trim();

            query = query.Where(
                activity =>
                    activity.Title.Contains(searchTerm) ||
                    (
                        activity.Description != null &&
                        activity.Description.Contains(
                            searchTerm)
                    ) ||
                    (
                        activity.BusinessOutcome != null &&
                        activity.BusinessOutcome.Contains(
                            searchTerm)
                    ));
        }

        return await query
            .OrderBy(activity =>
                activity.WorkflowBucket.SortOrder)
            .ThenBy(activity => activity.SortOrder)
            .ThenBy(activity => activity.Title)
            .Select(ActivityProjection.ToResponse)
            .ToListAsync(cancellationToken);
    }

    private static bool TryParseEnum<TEnum>(
        string? value,
        out TEnum result)
        where TEnum : struct, Enum
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            result = default;
            return false;
        }

        return Enum.TryParse(
            value,
            ignoreCase: true,
            out result);
    }
}