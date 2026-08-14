using AitoWorkflowAndHuddleGenerator.Application.Abstractions.Identity;
using AitoWorkflowAndHuddleGenerator.Application.Abstractions.Persistence;
using AitoWorkflowAndHuddleGenerator.Application.Common.Exceptions;
using AitoWorkflowAndHuddleGenerator.Application.Features.Huddles.Sessions.Common;
using AitoWorkflowAndHuddleGenerator.Contracts.Huddles;
using AitoWorkflowAndHuddleGenerator.Domain.Entities;
using AitoWorkflowAndHuddleGenerator.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AitoWorkflowAndHuddleGenerator.Application.Features.Huddles.Sessions.Commands.SetHuddleActivityCompletion;

/// <summary>
/// Handles the Set Huddle Activity Completion command.
/// </summary>
public sealed class SetHuddleActivityCompletionCommandHandler(IApplicationDbContext dbContext, ICurrentUserService currentUserService)
    : IRequestHandler<SetHuddleActivityCompletionCommand, HuddleSessionResponse>
{
    /// <summary>
    /// Handles the request through the application pipeline.
    /// </summary>
    public async Task<HuddleSessionResponse> Handle(SetHuddleActivityCompletionCommand request, CancellationToken cancellationToken)
    {
        string ownerObjectId = currentUserService.ObjectId
            ?? throw new UnauthorizedAccessException(AuthenticationMessages.MissingObjectIdClaim);
        UserHuddleSession session = await dbContext.UserHuddleSessions
            .Include(item => item.HuddleTopic).Include(item => item.CurrentHuddlePhase)
            .Include(item => item.ActivityProgress).ThenInclude(item => item.HuddleActivity)
            .SingleOrDefaultAsync(item => item.OwnerObjectId == ownerObjectId
                && item.HuddleTopic.ExternalId == request.HuddleExternalId.Trim(), cancellationToken)
            ?? throw new NotFoundException(HuddleMessages.SessionNotFound);
        if (session.SessionStatus == HuddleSessionStatus.Completed) throw new ConflictException(HuddleMessages.SessionAlreadyComplete);
        HuddleActivity activity = await dbContext.HuddleActivities.SingleOrDefaultAsync(item =>
            item.ExternalId == request.ActivityExternalId.Trim() && item.HuddleTopicId == session.HuddleTopicId, cancellationToken)
            ?? throw new NotFoundException(HuddleMessages.ActivityDoesNotBelong);
        dbContext.UserHuddleSessions.Entry(session).Property(item => item.RowVersion).OriginalValue = Convert.FromBase64String(request.RowVersion);
        UserHuddleActivityProgress? progress = session.ActivityProgress.SingleOrDefault(item => item.HuddleActivityId == activity.Id);
        DateTimeOffset now = DateTimeOffset.UtcNow;
        if (progress is null && request.IsCompleted)
        {
            progress = new UserHuddleActivityProgress { UserHuddleSession = session, HuddleActivity = activity };
            session.ActivityProgress.Add(progress);
        }
        if (progress is not null && progress.IsCompleted != request.IsCompleted)
        {
            progress.IsCompleted = request.IsCompleted;
            progress.CompletedAtUtc = request.IsCompleted ? now : null;
            session.LastSavedAtUtc = now;
            session.UpdatedAtUtc = now;
        }
        try { await dbContext.SaveChangesAsync(cancellationToken); }
        catch (DbUpdateConcurrencyException) { throw new ConflictException(HuddleMessages.SessionChangedByAnotherRequest); }
        List<HuddleActivity> validActivities = await dbContext.HuddleActivities.AsNoTracking()
            .Where(item => item.HuddleTopicId == session.HuddleTopicId).ToListAsync(cancellationToken);
        return HuddleSessionMappings.ToResponse(session, validActivities);
    }
}
