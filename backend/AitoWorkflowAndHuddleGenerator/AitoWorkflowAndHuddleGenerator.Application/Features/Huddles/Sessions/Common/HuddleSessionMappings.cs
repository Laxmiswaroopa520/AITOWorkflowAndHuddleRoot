using AitoWorkflowAndHuddleGenerator.Contracts.Huddles;
using AitoWorkflowAndHuddleGenerator.Domain.Entities;
using AitoWorkflowAndHuddleGenerator.Domain.Enums;

namespace AitoWorkflowAndHuddleGenerator.Application.Features.Huddles.Sessions.Common;

public static class HuddleSessionMappings
{
    public static HuddleSessionResponse ToResponse(UserHuddleSession session, IReadOnlyList<HuddleActivity> validActivities)
    {
        HashSet<int> validIds = validActivities.Select(activity => activity.Id).ToHashSet();
        List<UserHuddleActivityProgress> validProgress = session.ActivityProgress
            .Where(progress => validIds.Contains(progress.HuddleActivityId))
            .OrderBy(progress => progress.HuddleActivity.DisplayOrder)
            .ThenBy(progress => progress.HuddleActivity.ExternalId)
            .ToList();
        string[] removedActivityExternalIds = session.ActivityProgress
            .Where(progress => !validIds.Contains(progress.HuddleActivityId))
            .Select(progress => progress.HuddleActivity.ExternalId)
            .OrderBy(externalId => externalId, StringComparer.OrdinalIgnoreCase)
            .ToArray();
        int completedActivityCount = validProgress.Count(progress => progress.IsCompleted);
        bool canContinue = session.SessionStatus == HuddleSessionStatus.InProgress
            && validActivities.Count > completedActivityCount;

        return new HuddleSessionResponse(
            session.HuddleTopic.ExternalId,
            session.CurrentHuddlePhase is not null && session.CurrentHuddlePhase.HuddleTopicId == session.HuddleTopicId
                ? session.CurrentHuddlePhase.ExternalId
                : null,
            session.Notes,
            session.StartedAtUtc,
            session.LastSavedAtUtc,
            session.CompletedAtUtc,
            session.SessionStatus.ToString(),
            Convert.ToBase64String(session.RowVersion),
            validProgress.Select(progress => new HuddleSessionActivityProgressResponse(
                progress.HuddleActivity.ExternalId,
                progress.IsCompleted,
                progress.CompletedAtUtc)).ToArray(),
            removedActivityExternalIds,
            validActivities.Count,
            completedActivityCount,
            canContinue);
    }
}
