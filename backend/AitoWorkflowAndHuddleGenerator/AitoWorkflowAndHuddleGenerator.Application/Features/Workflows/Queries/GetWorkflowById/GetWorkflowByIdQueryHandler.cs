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

public sealed class
    GetWorkflowByIdQueryHandler
    : IRequestHandler<
        GetWorkflowByIdQuery,
        WorkflowResponse>
{
    private readonly
        IApplicationDbContext _dbContext;

    private readonly
        ICurrentUserService
            _currentUserService;

    public GetWorkflowByIdQueryHandler(
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
            GetWorkflowByIdQuery request,
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
                "The workflow was not found.");

        return WorkflowMappings
            .ToResponse(workflow);
    }
}