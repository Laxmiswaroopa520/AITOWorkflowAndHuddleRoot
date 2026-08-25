using AitoWorkflowAndHuddleGenerator.Application.Abstractions.Persistence;
using AitoWorkflowAndHuddleGenerator.Application.Common.Exceptions;
using AitoWorkflowAndHuddleGenerator.Application.Features.Huddles.Catalog.Common;
using AitoWorkflowAndHuddleGenerator.Domain.Entities;
using AitoWorkflowAndHuddleGenerator.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace AitoWorkflowAndHuddleGenerator.Application.Features.Huddles.Sessions.Common;

/// <summary>
/// Resolves which activities a session actually tracks.
/// </summary>
/// <remarks>
/// Two rules, both of which the earlier topic-wide count broke. Only Featured activities are
/// completable, because Extended activities are optional depth. And a session belongs to one
/// placement, because the same topic appears on several role paths with different activities, so
/// counting every activity on the topic reported a total the facilitator can never reach.
/// </remarks>
internal static class HuddleSessionActivityScope
{
    /// <summary>
    /// The Featured activities for one placement of a topic, or for the whole topic when no
    /// placement is named.
    /// </summary>
    public static async Task<List<HuddleActivity>> LoadCompletableAsync(
        IApplicationDbContext dbContext,
        int huddleTopicId,
        string topicExternalId,
        string? placementExternalId,
        CancellationToken cancellationToken)
    {
        string? placement = string.IsNullOrWhiteSpace(placementExternalId) ? null : placementExternalId.Trim();

        // Match the detail read: with no placement named, track the topic's default placement
        // rather than every placement's activities, which reported "0 of 21" on a 3-activity phase.
        placement ??= await HuddlePlacementLookup.ResolveDefaultExternalIdAsync(
            dbContext, huddleTopicId, cancellationToken);

        if (placement is null)
            return await dbContext.HuddleActivities.AsNoTracking()
                .Where(activity => activity.HuddleTopicId == huddleTopicId
                    && activity.PracticeTier == HuddlePracticeTier.Featured)
                .ToListAsync(cancellationToken);

        int placementId = await dbContext.HuddlePlacements.AsNoTracking()
            .Where(item => item.ExternalId == placement && item.HuddleTopicId == huddleTopicId)
            .Select(item => (int?)item.Id)
            .SingleOrDefaultAsync(cancellationToken)
            ?? throw new NotFoundException(HuddleMessages.PlacementNotFound(placement, topicExternalId));

        return await dbContext.HuddleActivities.AsNoTracking()
            .Where(activity => activity.HuddlePlacementId == placementId
                && activity.PracticeTier == HuddlePracticeTier.Featured)
            .ToListAsync(cancellationToken);
    }
}
