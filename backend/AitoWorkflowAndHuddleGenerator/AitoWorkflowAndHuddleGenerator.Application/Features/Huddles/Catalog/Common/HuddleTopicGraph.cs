using AitoWorkflowAndHuddleGenerator.Application.Abstractions.Persistence;
using AitoWorkflowAndHuddleGenerator.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace AitoWorkflowAndHuddleGenerator.Application.Features.Huddles.Catalog.Common;

/// <summary>
/// Loads the topic graph a catalogue card renders, in one place, so the catalogue, the Role Path
/// and the saved plan all read the same shape.
/// </summary>
internal static class HuddleTopicGraph
{
    /// <summary>
    /// The reference data a catalogue card renders: focus area, aligned roles, agents, MCEM stages.
    /// </summary>
    public static IQueryable<HuddleTopic> AddCatalogIncludes(IQueryable<HuddleTopic> query) => query
        .Include(x => x.HuddleFocusArea)
        .Include(x => x.TopicRoles).ThenInclude(x => x.Role)
        .Include(x => x.TopicAgents).ThenInclude(x => x.HuddleAgent)
        .Include(x => x.McemStages).ThenInclude(x => x.HuddleMcemStage);

    /// <summary>
    /// Loads the given topics with their catalogue reference data and returns them in the order the
    /// identifiers were supplied. One read for the seven weeks a plan shows, rather than one
    /// include tree for the recommended path and a second, nested one for the saved plan.
    /// </summary>
    public static async Task<List<HuddleTopic>> LoadCatalogGraphAsync(
        IApplicationDbContext dbContext,
        IReadOnlyList<int> topicIdsInOrder,
        CancellationToken cancellationToken)
    {
        if (topicIdsInOrder.Count == 0) return [];

        List<int> ids = topicIdsInOrder.Distinct().ToList();
        List<HuddleTopic> topics = await AddCatalogIncludes(
                dbContext.HuddleTopics.AsNoTracking().Where(topic => ids.Contains(topic.Id)))
            .ToListAsync(cancellationToken);

        Dictionary<int, HuddleTopic> byId = topics.ToDictionary(topic => topic.Id);
        List<HuddleTopic> ordered = [];
        foreach (int id in topicIdsInOrder)
            if (byId.TryGetValue(id, out HuddleTopic? topic)) ordered.Add(topic);
        return ordered;
    }
}
