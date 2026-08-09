using AitoWorkflowAndHuddleGenerator
    .Application
    .Abstractions
    .Identity;
using AitoWorkflowAndHuddleGenerator
    .Application
    .Abstractions
    .Persistence;
using AitoWorkflowAndHuddleGenerator
    .Application
    .Common
    .Exceptions;
using AitoWorkflowAndHuddleGenerator
    .Application
    .Features
    .Workflows
    .Common;
using AitoWorkflowAndHuddleGenerator
    .Contracts
    .Workflows;
using AitoWorkflowAndHuddleGenerator
    .Domain
    .Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AitoWorkflowAndHuddleGenerator
    .Application
    .Features
    .Workflows
    .Commands
    .SaveWorkflow;

public sealed class
    SaveWorkflowCommandHandler
    : IRequestHandler<
        SaveWorkflowCommand,
        WorkflowResponse>
{
    private readonly
        IApplicationDbContext _dbContext;

    private readonly
        ICurrentUserService
            _currentUserService;

    public SaveWorkflowCommandHandler(
        IApplicationDbContext dbContext,
        ICurrentUserService
            currentUserService)
    {
        _dbContext = dbContext;
        _currentUserService =
            currentUserService;
    }

    public async Task<WorkflowResponse>
        Handle(
            SaveWorkflowCommand request,
            CancellationToken
                cancellationToken)
    {
        string ownerObjectId =
            GetRequiredOwnerObjectId();

        string normalizedName =
            request.Name.Trim();

        bool duplicateExists =
            await _dbContext
                .UserWorkflows
                .AsNoTracking()
                .AnyAsync(
                    workflow =>
                        workflow
                            .OwnerObjectId ==
                        ownerObjectId &&
                        workflow.Name ==
                        normalizedName,
                    cancellationToken);

        if (duplicateExists)
        {
            throw new ConflictException(
                $"A workflow named '{normalizedName}' already exists.");
        }

        Role role =
            await _dbContext
                .Roles
                .SingleOrDefaultAsync(
                    role =>
                        role.ExternalId ==
                            request
                                .RoleExternalId &&
                        role.IsActive,
                    cancellationToken)
            ?? throw new NotFoundException(
                "The selected role was not found.");

        string[] requestedActivityIds =
            request
                .ActivityExternalIds
                .Where(id =>
                    !string.IsNullOrWhiteSpace(
                        id))
                .Select(id => id.Trim())
                .Distinct(
                    StringComparer
                        .OrdinalIgnoreCase)
                .ToArray();

        List<Activity> activities =
            await _dbContext
                .Activities
                .Where(activity =>
                    requestedActivityIds
                        .Contains(
                            activity
                                .ExternalId) &&
                    activity.IsActive)
                .ToListAsync(
                    cancellationToken);

        if (
            activities.Count !=
            requestedActivityIds.Length)
        {
            throw new NotFoundException(
                "One or more selected activities no longer exist.");
        }

        bool invalidRoleActivity =
            activities.Any(
                activity =>
                    activity.RoleId != role.Id);

        if (invalidRoleActivity)
        {
            throw new ConflictException(
                "One or more activities do not belong to the selected role.");
        }

        Dictionary<string, Activity>
            activitiesByExternalId =
                activities.ToDictionary(
                    activity =>
                        activity.ExternalId,
                    StringComparer
                        .OrdinalIgnoreCase);

        Guid workflowId =
            Guid.NewGuid();

        DateTimeOffset utcNow =
            DateTimeOffset.UtcNow;

        var workflow =
            new UserWorkflow
            {
                Id = workflowId,

                OwnerObjectId =
                    ownerObjectId,

                OwnerEmail =
                    _currentUserService
                        .Email?
                        .Trim()
                    ?? string.Empty,

                OwnerDisplayName =
                    _currentUserService
                        .DisplayName?
                        .Trim()
                    ?? _currentUserService
                        .Email?
                        .Trim()
                    ?? "Unknown user",

                Name = normalizedName,

                Description =
                    NormalizeOptionalText(
                        request.Description),

                RoleId = role.Id,

                TotalDurationMinutes =
                    activities.Sum(
                        activity =>
                            activity
                                .DurationMinutes),

                IsFavorite = false,
            };

        for (
            int index = 0;
            index <
                requestedActivityIds.Length;
            index++)
        {
            Activity activity =
                activitiesByExternalId[
                    requestedActivityIds[
                        index]];

            workflow
                .UserWorkflowActivities
                .Add(
                    new UserWorkflowActivity
                    {
                        UserWorkflowId =
                            workflowId,

                        ActivityId =
                            activity.Id,

                        SortOrder = index,

                        AddedAtUtc = utcNow,
                    });
        }

        _dbContext
            .UserWorkflows
            .Add(workflow);

        await _dbContext
            .SaveChangesAsync(
                cancellationToken);

        UserWorkflow savedWorkflow =
            await LoadOwnedWorkflowAsync(
                workflowId,
                ownerObjectId,
                cancellationToken);

        return WorkflowMappings
            .ToResponse(savedWorkflow);
    }

    private string
        GetRequiredOwnerObjectId()
    {
        if (
            !_currentUserService
                .IsAuthenticated)
        {
            throw new UnauthorizedAccessException(
                "The current request is not authenticated.");
        }

        return _currentUserService
            .ObjectId
            ?? throw new UnauthorizedAccessException(
                "The authenticated token does not contain an oid claim.");
    }

    private async Task<UserWorkflow>
        LoadOwnedWorkflowAsync(
            Guid workflowId,
            string ownerObjectId,
            CancellationToken
                cancellationToken)
    {
        return await _dbContext
            .UserWorkflows
            .AsNoTracking()
            .Include(
                workflow =>
                    workflow.Role)
            .Include(
                workflow =>
                    workflow
                        .UserWorkflowActivities)
            .ThenInclude(
                mapping =>
                    mapping.Activity)
            .ThenInclude(
                activity =>
                    activity.WorkflowBucket)
            .SingleAsync(
                workflow =>
                    workflow.Id ==
                        workflowId &&
                    workflow.OwnerObjectId ==
                        ownerObjectId,
                cancellationToken);
    }

    private static string?
        NormalizeOptionalText(
            string? value)
    {
        return string.IsNullOrWhiteSpace(
            value)
            ? null
            : value.Trim();
    }
}