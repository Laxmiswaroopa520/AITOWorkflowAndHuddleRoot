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
    .Queries
    .GetWorkflowById;

/// <summary>
/// Handles the Get Workflow By Id query.
/// </summary>
public sealed class
    GetWorkflowByIdQueryHandler
    : IRequestHandler<
        GetWorkflowByIdQuery,
        WorkflowResponse>
{
    private readonly
        IApplicationDbContext dbContext;

    private readonly ICurrentUserService currentUserService;

    public GetWorkflowByIdQueryHandler(
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
            GetWorkflowByIdQuery request,
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
                        activity
                            .WorkflowBucket)
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

        return WorkflowMappings
            .ToResponse(workflow);
    }
}