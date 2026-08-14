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

/// <summary>
/// Handles the Delete Workflow command.
/// </summary>
public sealed class
    DeleteWorkflowCommandHandler
    : IRequestHandler<
        DeleteWorkflowCommand>
{
    private readonly
        IApplicationDbContext dbContext;

    private readonly
        ICurrentUserService
            currentUserService;

    public DeleteWorkflowCommandHandler(
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

    public async Task Handle(
        DeleteWorkflowCommand request,
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
            .Remove(workflow);

        await dbContext
            .SaveChangesAsync(
                cancellationToken);
    }
}