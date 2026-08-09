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

public sealed class
    ToggleFavoriteCommandHandler
    : IRequestHandler<
        ToggleFavoriteCommand,
        WorkflowSummaryResponse>
{
    private readonly
        IApplicationDbContext _dbContext;

    private readonly
        ICurrentUserService
            _currentUserService;

    public ToggleFavoriteCommandHandler(
        IApplicationDbContext dbContext,
        ICurrentUserService
            currentUserService)
    {
        _dbContext = dbContext;
        _currentUserService =
            currentUserService;
    }

    public async Task<
        WorkflowSummaryResponse>
        Handle(
            ToggleFavoriteCommand request,
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
                "The workflow was not found.");

        _dbContext
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

        return WorkflowMappings
            .ToSummary(workflow);
    }
}