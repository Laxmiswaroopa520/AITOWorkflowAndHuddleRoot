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

public sealed class
    GetFavoriteWorkflowsQueryHandler
    : IRequestHandler<
        GetFavoriteWorkflowsQuery,
        IReadOnlyCollection<
            WorkflowSummaryResponse>>
{
    private readonly
        IApplicationDbContext _dbContext;

    private readonly
        ICurrentUserService
            _currentUserService;

    public GetFavoriteWorkflowsQueryHandler(
        IApplicationDbContext dbContext,
        ICurrentUserService
            currentUserService)
    {
        _dbContext = dbContext;
        _currentUserService =
            currentUserService;
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
            _currentUserService.ObjectId
            ?? throw new UnauthorizedAccessException(
                "The authenticated token does not contain an oid claim.");

        List<UserWorkflow> workflows =
            await _dbContext
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