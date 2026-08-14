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

/// <summary>
/// Handles the Save Workflow command.
/// </summary>
public sealed class
    SaveWorkflowCommandHandler
    : IRequestHandler<
        SaveWorkflowCommand,
        WorkflowResponse>
{
    private readonly
        IApplicationDbContext dbContext;

    private readonly
        ICurrentUserService
            currentUserService;

    public SaveWorkflowCommandHandler(
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
            SaveWorkflowCommand request,
            CancellationToken
                cancellationToken)
    {
        string ownerObjectId =
            GetRequiredOwnerObjectId();

        string normalizedName =
            request.Name.Trim();

        bool duplicateExists =
            await dbContext
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
            await dbContext
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
                WorkflowMessages.SelectedActivitiesNotFound);
        }

        bool invalidRoleActivity =
            activities.Any(
                activity =>
                    activity.RoleId != role.Id);

        if (invalidRoleActivity)
        {
            throw new ConflictException(
                WorkflowMessages.ActivitiesDoNotBelongToRole);
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
                    currentUserService
                        .Email?
                        .Trim()
                    ?? string.Empty,

                OwnerDisplayName =
                    currentUserService
                        .DisplayName?
                        .Trim()
                    ?? currentUserService
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

        dbContext
            .UserWorkflows
            .Add(workflow);

        await dbContext
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
            !currentUserService
                .IsAuthenticated)
        {
            throw new UnauthorizedAccessException(
                AuthenticationMessages.RequestNotAuthenticated);
        }

        return currentUserService
            .ObjectId
            ?? throw new UnauthorizedAccessException(
                AuthenticationMessages.MissingObjectIdClaim);
    }

    private async Task<UserWorkflow>
        LoadOwnedWorkflowAsync(
            Guid workflowId,
            string ownerObjectId,
            CancellationToken
                cancellationToken)
    {
        return await dbContext
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