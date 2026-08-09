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
    .UpdateWorkflow;

public sealed class
    UpdateWorkflowCommandHandler
    : IRequestHandler<
        UpdateWorkflowCommand,
        WorkflowResponse>
{
    private readonly
        IApplicationDbContext _dbContext;

    private readonly
        ICurrentUserService
            _currentUserService;

    public UpdateWorkflowCommandHandler(
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
            UpdateWorkflowCommand request,
            CancellationToken
                cancellationToken)
    {
        string ownerObjectId =
            _currentUserService.ObjectId
            ?? throw new UnauthorizedAccessException(
                "The authenticated token does not contain an oid claim.");

        UserWorkflow workflow =
            await _dbContext
                .UserWorkflows
                .Include(
                    workflow =>
                        workflow
                            .UserWorkflowActivities)
                .SingleOrDefaultAsync(
                    workflow =>
                        workflow.Id ==
                            request
                                .WorkflowId &&
                        workflow
                            .OwnerObjectId ==
                            ownerObjectId,
                    cancellationToken)
            ?? throw new NotFoundException(
                "The workflow was not found.");

        string normalizedName =
            request.Name.Trim();

        bool duplicateExists =
            await _dbContext
                .UserWorkflows
                .AsNoTracking()
                .AnyAsync(
                    otherWorkflow =>
                        otherWorkflow
                            .OwnerObjectId ==
                            ownerObjectId &&
                        otherWorkflow.Name ==
                            normalizedName &&
                        otherWorkflow.Id !=
                            workflow.Id,
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

        string[] activityExternalIds =
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
                    activityExternalIds
                        .Contains(
                            activity
                                .ExternalId) &&
                    activity.IsActive)
                .ToListAsync(
                    cancellationToken);

        if (
            activities.Count !=
            activityExternalIds.Length)
        {
            throw new NotFoundException(
                "One or more selected activities no longer exist.");
        }

        if (
            activities.Any(
                activity =>
                    activity.RoleId !=
                        role.Id))
        {
            throw new ConflictException(
                "One or more activities do not belong to the selected role.");
        }

        byte[] originalRowVersion =
            Convert.FromBase64String(
                request.RowVersion);

        _dbContext
            .UserWorkflows
            .Entry(workflow)
            .Property(
                item =>
                    item.RowVersion)
            .OriginalValue =
                originalRowVersion;

        workflow.Name =
            normalizedName;

        workflow.Description =
            string.IsNullOrWhiteSpace(
                request.Description)
                ? null
                : request
                    .Description
                    .Trim();

        workflow.RoleId = role.Id;

        workflow.TotalDurationMinutes =
            activities.Sum(
                activity =>
                    activity
                        .DurationMinutes);

        _dbContext
            .UserWorkflowActivities
            .RemoveRange(
                workflow
                    .UserWorkflowActivities);

        Dictionary<string, Activity>
            activitiesByExternalId =
                activities.ToDictionary(
                    activity =>
                        activity.ExternalId,
                    StringComparer
                        .OrdinalIgnoreCase);

        DateTimeOffset utcNow =
            DateTimeOffset.UtcNow;

        for (
            int index = 0;
            index <
                activityExternalIds.Length;
            index++)
        {
            Activity activity =
                activitiesByExternalId[
                    activityExternalIds[
                        index]];

            _dbContext
                .UserWorkflowActivities
                .Add(
                    new UserWorkflowActivity
                    {
                        UserWorkflowId =
                            workflow.Id,

                        ActivityId =
                            activity.Id,

                        SortOrder = index,

                        AddedAtUtc =
                            utcNow,
                    });
        }

        try
        {
            await _dbContext
                .SaveChangesAsync(
                    cancellationToken);
        }
        catch (
            DbUpdateConcurrencyException)
        {
            throw new ConflictException(
                "This workflow was changed by another request. Refresh and try again.");
        }

        UserWorkflow updatedWorkflow =
            await _dbContext
                .UserWorkflows
                .AsNoTracking()
                .Include(
                    item =>
                        item.Role)
                .Include(
                    item =>
                        item
                            .UserWorkflowActivities)
                .ThenInclude(
                    mapping =>
                        mapping.Activity)
                .ThenInclude(
                    activity =>
                        activity
                            .WorkflowBucket)
                .SingleAsync(
                    item =>
                        item.Id ==
                            workflow.Id &&
                        item.OwnerObjectId ==
                            ownerObjectId,
                    cancellationToken);

        return WorkflowMappings
            .ToResponse(
                updatedWorkflow);
    }
}