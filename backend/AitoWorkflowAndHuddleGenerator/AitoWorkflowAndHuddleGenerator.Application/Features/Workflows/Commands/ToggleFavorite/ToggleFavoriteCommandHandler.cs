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
    .ToggleFavorite;

/// <summary>
/// Handles the Toggle Favorite command.
/// </summary>
public sealed class
    ToggleFavoriteCommandHandler
    : IRequestHandler<
        ToggleFavoriteCommand,
        WorkflowSummaryResponse>
{
    private readonly
        IApplicationDbContext dbContext;

    private readonly
        ICurrentUserService
            currentUserService;

    public ToggleFavoriteCommandHandler(
        IApplicationDbContext dbContext,
        ICurrentUserService
            currentUserService)
    {
        this.dbContext = dbContext;
        this.currentUserService = currentUserService;
    }

    public async Task<
        WorkflowSummaryResponse>
        Handle(
            ToggleFavoriteCommand request,
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
                        workflow.Role)
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

        dbContext
            .UserWorkflows
            .Entry(workflow)
            .Property(
                item =>
                    item.RowVersion)
            .OriginalValue =
                Convert.FromBase64String(
                    request.RowVersion);

        workflow.IsFavorite =
            request.IsFavorite;

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

        return WorkflowMappings
            .ToSummary(workflow);
    }
}