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
    .Domain
    .Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AitoWorkflowAndHuddleGenerator
    .Application
    .Features
    .Workflows
    .Commands
    .DeleteWorkflow;

public sealed class
    DeleteWorkflowCommandHandler
    : IRequestHandler<
        DeleteWorkflowCommand>
{
    private readonly
        IApplicationDbContext _dbContext;

    private readonly
        ICurrentUserService
            _currentUserService;

    public DeleteWorkflowCommandHandler(
        IApplicationDbContext dbContext,
        ICurrentUserService
            currentUserService)
    {
        _dbContext = dbContext;
        _currentUserService =
            currentUserService;
    }

    public async Task Handle(
        DeleteWorkflowCommand request,
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
            .Remove(workflow);

        await _dbContext
            .SaveChangesAsync(
                cancellationToken);
    }
}