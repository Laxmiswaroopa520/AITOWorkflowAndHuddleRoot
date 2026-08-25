using AitoWorkflowAndHuddleGenerator.Application.Abstractions.Identity;
using AitoWorkflowAndHuddleGenerator.Application.Abstractions.Persistence;
using AitoWorkflowAndHuddleGenerator.Application.Features.Huddles.Sessions.Common;
using AitoWorkflowAndHuddleGenerator.Contracts.Huddles;
using AitoWorkflowAndHuddleGenerator.Domain.Entities;
using AitoWorkflowAndHuddleGenerator.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AitoWorkflowAndHuddleGenerator.Application.Features.Huddles.Sessions.Queries.GetMyIncompleteHuddleSessions;

/// <summary>
/// Handles the Get My Incomplete Huddle Sessions query.
/// </summary>
public sealed class GetMyIncompleteHuddleSessionsQueryHandler(IApplicationDbContext dbContext, ICurrentUserService currentUserService)
    : IRequestHandler<GetMyIncompleteHuddleSessionsQuery, IReadOnlyList<IncompleteHuddleSessionResponse>>
{
    /// <summary>
    /// Handles the request through the application pipeline.
    /// </summary>
    public async Task<IReadOnlyList<IncompleteHuddleSessionResponse>> Handle(GetMyIncompleteHuddleSessionsQuery request, CancellationToken cancellationToken)
    {
        string ownerObjectId = currentUserService.ObjectId
            ?? throw new UnauthorizedAccessException(AuthenticationMessages.MissingObjectIdClaim);
        List<UserHuddleSession> sessions = await dbContext.UserHuddleSessions.AsNoTracking()
            .Where(item => item.OwnerObjectId == ownerObjectId
                && item.SessionStatus == HuddleSessionStatus.InProgress
                && item.HuddleTopic.PublicationStatus == "Published")
            .Include(item => item.HuddleTopic)
            .Include(item => item.CurrentHuddlePhase)
            .Include(item => item.ActivityProgress).ThenInclude(item => item.HuddleActivity)
            .OrderByDescending(item => item.LastSavedAtUtc)
            .ToListAsync(cancellationToken);
        int[] topicIds = sessions.Select(session => session.HuddleTopicId).Distinct().ToArray();
        // Featured only, matching the workspace: Extended activities never gate a resume prompt.
        List<HuddleActivity> activities = await dbContext.HuddleActivities.AsNoTracking()
            .Where(activity => topicIds.Contains(activity.HuddleTopicId)
                && activity.PracticeTier == HuddlePracticeTier.Featured)
            .ToListAsync(cancellationToken);
        return sessions.Select(session => new
            {
                Session = session,
                Response = HuddleSessionMappings.ToResponse(session, CompletableFor(session, activities))
            })
            .Where(item => item.Response.CanContinue)
            .Select(item => new IncompleteHuddleSessionResponse(
                item.Session.HuddleTopic.ExternalId,
                item.Session.HuddleTopic.Name,
                item.Session.HuddleTopic.Description,
                item.Session.HuddleTopic.Type,
                item.Response))
            .ToArray();
    }

    /// <summary>
    /// The session's own placement when its current phase names one, so the resume count reflects
    /// the role path the facilitator is actually working rather than every role sharing the topic.
    /// </summary>
    private static List<HuddleActivity> CompletableFor(UserHuddleSession session, List<HuddleActivity> activities) =>
        session.CurrentHuddlePhase?.HuddlePlacementId is int placementId
            ? activities.Where(activity => activity.HuddlePlacementId == placementId).ToList()
            : activities.Where(activity => activity.HuddleTopicId == session.HuddleTopicId).ToList();
}
