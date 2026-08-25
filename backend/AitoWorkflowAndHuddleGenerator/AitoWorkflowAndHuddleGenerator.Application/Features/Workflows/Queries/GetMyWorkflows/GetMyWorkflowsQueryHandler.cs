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

/// <summary>
/// Handles the Get My Workflows query.
/// </summary>
public sealed class
    GetMyWorkflowsQueryHandler
    : IRequestHandler<
        GetMyWorkflowsQuery,
        IReadOnlyCollection<
            WorkflowSummaryResponse>>
{
    private readonly
        IApplicationDbContext dbContext;

    private readonly
        ICurrentUserService
            currentUserService;

    public GetMyWorkflowsQueryHandler(
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
            GetMyWorkflowsQuery request,
            CancellationToken
                cancellationToken)
    {
        string ownerObjectId =
            currentUserService
                .ObjectId
            ?? throw new UnauthorizedAccessException(
                AuthenticationMessages.MissingObjectIdClaim);

        IQueryable<UserWorkflow> query =
            dbContext
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