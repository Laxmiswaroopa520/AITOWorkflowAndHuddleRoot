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
    .Queries
    .GetFavoriteWorkflows;

/// <summary>
/// Handles the Get Favorite Workflows query.
/// </summary>
public sealed class
    GetFavoriteWorkflowsQueryHandler
    : IRequestHandler<
        GetFavoriteWorkflowsQuery,
        IReadOnlyCollection<
            WorkflowSummaryResponse>>
{
    private readonly
        IApplicationDbContext dbContext;

    private readonly
        ICurrentUserService
            currentUserService;

    public GetFavoriteWorkflowsQueryHandler(
        IApplicationDbContext dbContext,
        ICurrentUserService
            currentUserService)
    {
        this.dbContext = dbContext;
        this.currentUserService = currentUserService;
    }

    public async Task<
        IReadOnlyCollection<
            WorkflowSummaryResponse>>
        Handle(
            GetFavoriteWorkflowsQuery
                request,
            CancellationToken
                cancellationToken)
    {
        string ownerObjectId =
            currentUserService.ObjectId
            ?? throw new UnauthorizedAccessException(
                AuthenticationMessages.MissingObjectIdClaim);

        List<UserWorkflow> workflows =
            await dbContext
                .UserWorkflows
                .AsNoTracking()
                .Where(workflow =>
                    workflow.OwnerObjectId ==
                        ownerObjectId &&
                    workflow.IsFavorite)
                .Include(
                    workflow =>
                        workflow.Role)
                .Include(
                    workflow =>
                        workflow
                            .UserWorkflowActivities)
                .OrderByDescending(
                    workflow =>
                        workflow
                            .UpdatedAtUtc ??
                        workflow.CreatedAtUtc)
                .ToListAsync(
                    cancellationToken);

        return workflows
            .Select(
                WorkflowMappings
                    .ToSummary)
            .ToArray();
    }
}