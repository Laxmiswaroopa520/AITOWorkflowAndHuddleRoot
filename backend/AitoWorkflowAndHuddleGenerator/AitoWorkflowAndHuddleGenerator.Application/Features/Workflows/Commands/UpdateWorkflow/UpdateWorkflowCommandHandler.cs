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

/// <summary>
/// Handles the Update Workflow command.
/// </summary>
public sealed class
    UpdateWorkflowCommandHandler
    : IRequestHandler<
        UpdateWorkflowCommand,
        WorkflowResponse>
{
    private readonly
        IApplicationDbContext dbContext;

    private readonly
        ICurrentUserService
            currentUserService;

    public UpdateWorkflowCommandHandler(
        IApplicationDbContext dbContext,
        ICurrentUserService
            currentUserService)
    {
        this.dbContext = dbContext;
        this.currentUserService = currentUserService;
    }

    /// <summary>
    /// Handles the request through the application pipeline.
    /// </summary>

    public async Task<WorkflowResponse>
        Handle(
            UpdateWorkflowCommand request,
            CancellationToken
                cancellationToken)
    {
        string ownerObjectId =
            currentUserService.ObjectId
            ?? throw new UnauthorizedAccessException(
                AuthenticationMessages.MissingObjectIdClaim);

        UserWorkflow workflow =
            await dbContext
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
                WorkflowMessages.NotFound);

        string normalizedName =
            request.Name.Trim();

        bool duplicateExists =
            await dbContext
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
                WorkflowMessages.DuplicateName(normalizedName));
        }

        Role role =
            await dbContext
                .Roles
                .SingleOrDefaultAsync(
                    role =>
                        role.ExternalId ==
                            request
                                .RoleExternalId &&
                        role.IsActive,
                    cancellationToken)
            ?? throw new NotFoundException(
                WorkflowMessages.SelectedRoleNotFound);

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
            await dbContext
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
                WorkflowMessages.SelectedActivitiesNotFound);
        }

        if (
            activities.Any(
                activity =>
                    activity.RoleId !=
                        role.Id))
        {
            throw new ConflictException(
                WorkflowMessages.ActivitiesDoNotBelongToRole);
        }

        byte[] originalRowVersion =
            Convert.FromBase64String(
                request.RowVersion);

        dbContext
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

        dbContext
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

            dbContext
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
            await dbContext
                .SaveChangesAsync(
                    cancellationToken);
        }
        catch (
            DbUpdateConcurrencyException)
        {
            throw new ConflictException(
                WorkflowMessages.ChangedByAnotherRequest);
        }

        UserWorkflow updatedWorkflow =
            await dbContext
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