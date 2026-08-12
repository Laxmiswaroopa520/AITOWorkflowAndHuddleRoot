using AitoWorkflowAndHuddleGenerator.Application.Abstractions.Identity;
using AitoWorkflowAndHuddleGenerator.Application.Abstractions.Persistence;
using AitoWorkflowAndHuddleGenerator.Application.Features.Huddles.Sessions.Common;
using AitoWorkflowAndHuddleGenerator.Contracts.Huddles;
using AitoWorkflowAndHuddleGenerator.Domain.Entities;
using AitoWorkflowAndHuddleGenerator.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AitoWorkflowAndHuddleGenerator.Application.Features.Huddles.Sessions.Queries.GetMyIncompleteHuddleSessions;

public sealed class GetMyIncompleteHuddleSessionsQueryHandler(IApplicationDbContext dbContext, ICurrentUserService currentUserService)
    : IRequestHandler<GetMyIncompleteHuddleSessionsQuery, IReadOnlyList<IncompleteHuddleSessionResponse>>
{
    public async Task<IReadOnlyList<IncompleteHuddleSessionResponse>> Handle(GetMyIncompleteHuddleSessionsQuery request, CancellationToken cancellationToken)
    {
        string ownerObjectId = currentUserService.ObjectId
            ?? throw new UnauthorizedAccessException("The authenticated token does not contain an oid claim.");
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
        List<HuddleActivity> activities = await dbContext.HuddleActivities.AsNoTracking()
            .Where(activity => topicIds.Contains(activity.HuddleTopicId)).ToListAsync(cancellationToken);
        return sessions.Select(session => new
            {
                Session = session,
                Response = HuddleSessionMappings.ToResponse(session, activities.Where(activity => activity.HuddleTopicId == session.HuddleTopicId).ToList())
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
}
