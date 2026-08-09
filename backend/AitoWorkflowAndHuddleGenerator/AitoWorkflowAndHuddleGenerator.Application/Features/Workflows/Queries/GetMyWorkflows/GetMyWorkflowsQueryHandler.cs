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
    .GetMyWorkflows;

public sealed class
    GetMyWorkflowsQueryHandler
    : IRequestHandler<
        GetMyWorkflowsQuery,
        IReadOnlyCollection<
            WorkflowSummaryResponse>>
{
    private readonly
        IApplicationDbContext _dbContext;

    private readonly
        ICurrentUserService
            _currentUserService;

    public GetMyWorkflowsQueryHandler(
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
            GetMyWorkflowsQuery request,
            CancellationToken
                cancellationToken)
    {
        string ownerObjectId =
            _currentUserService
                .ObjectId
            ?? throw new UnauthorizedAccessException(
                "The authenticated token does not contain an oid claim.");

        IQueryable<UserWorkflow> query =
            _dbContext
                .UserWorkflows
                .AsNoTracking()
                .Where(workflow =>
                    workflow.OwnerObjectId ==
                        ownerObjectId);

        if (
            request.IsFavorite
                .HasValue)
        {
            query = query.Where(
                workflow =>
                    workflow.IsFavorite ==
                    request.IsFavorite.Value);
        }

        if (
            !string.IsNullOrWhiteSpace(
                request.Search))
        {
            string search =
                request.Search.Trim();

            query = query.Where(
                workflow =>
                    workflow.Name
                        .Contains(search) ||
                    (
                        workflow.Description !=
                            null &&
                        workflow.Description
                            .Contains(search)
                    ));
        }

        List<UserWorkflow> workflows =
            await query
                .Include(
                    workflow =>
                        workflow.Role)
                .Include(
                    workflow =>
                        workflow
                            .UserWorkflowActivities)
                .OrderByDescending(
                    workflow =>
                        workflow.IsFavorite)
                .ThenByDescending(
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