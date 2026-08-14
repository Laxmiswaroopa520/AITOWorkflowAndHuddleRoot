using AitoWorkflowAndHuddleGenerator.Application.Abstractions.Identity;
using AitoWorkflowAndHuddleGenerator.Application.Abstractions.Persistence;
using AitoWorkflowAndHuddleGenerator.Application.Common.Exceptions;
using AitoWorkflowAndHuddleGenerator.Application.Features.Huddles.Sessions.Common;
using AitoWorkflowAndHuddleGenerator.Contracts.Huddles;
using AitoWorkflowAndHuddleGenerator.Domain.Entities;
using AitoWorkflowAndHuddleGenerator.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AitoWorkflowAndHuddleGenerator.Application.Features.Huddles.Sessions.Commands.CompleteHuddleSession;

/// <summary>
/// Handles the Complete Huddle Session command.
/// </summary>
public sealed class CompleteHuddleSessionCommandHandler(IApplicationDbContext dbContext, ICurrentUserService currentUserService)
    : IRequestHandler<CompleteHuddleSessionCommand, HuddleSessionResponse>
{
    /// <summary>
    /// Handles the request through the application pipeline.
    /// </summary>
    public async Task<HuddleSessionResponse> Handle(CompleteHuddleSessionCommand request, CancellationToken cancellationToken)
    {
        string ownerObjectId = currentUserService.ObjectId
            ?? throw new UnauthorizedAccessException(AuthenticationMessages.MissingObjectIdClaim);
        UserHuddleSession session = await dbContext.UserHuddleSessions
            .Include(item => item.HuddleTopic).Include(item => item.CurrentHuddlePhase)
            .Include(item => item.ActivityProgress).ThenInclude(item => item.HuddleActivity)
            .SingleOrDefaultAsync(item => item.OwnerObjectId == ownerObjectId
                && item.HuddleTopic.ExternalId == request.HuddleExternalId.Trim(), cancellationToken)
            ?? throw new NotFoundException(HuddleMessages.SessionNotFound);
        List<HuddleActivity> validActivities = await dbContext.HuddleActivities.AsNoTracking()
            .Where(item => item.HuddleTopicId == session.HuddleTopicId).ToListAsync(cancellationToken);
        if (session.SessionStatus == HuddleSessionStatus.Completed) return HuddleSessionMappings.ToResponse(session, validActivities);
        dbContext.UserHuddleSessions.Entry(session).Property(item => item.RowVersion).OriginalValue = Convert.FromBase64String(request.RowVersion);
        HashSet<int> completedIds = session.ActivityProgress.Where(item => item.IsCompleted).Select(item => item.HuddleActivityId).ToHashSet();
        if (validActivities.Count == 0 || validActivities.Any(activity => !completedIds.Contains(activity.Id)))
            throw new ConflictException(HuddleMessages.ActivitiesMustBeComplete);
        DateTimeOffset now = DateTimeOffset.UtcNow;
        session.SessionStatus = HuddleSessionStatus.Completed;
        session.CompletedAtUtc = now;
        session.LastSavedAtUtc = now;
        session.UpdatedAtUtc = now;
        try { await dbContext.SaveChangesAsync(cancellationToken); }
        catch (DbUpdateConcurrencyException) { throw new ConflictException(HuddleMessages.SessionChangedByAnotherRequest); }
        return HuddleSessionMappings.ToResponse(session, validActivities);
    }
}
