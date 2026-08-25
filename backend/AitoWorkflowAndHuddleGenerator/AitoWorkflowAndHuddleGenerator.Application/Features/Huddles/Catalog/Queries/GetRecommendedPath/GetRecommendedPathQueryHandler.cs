using AitoWorkflowAndHuddleGenerator.Application.Abstractions.Persistence;
using AitoWorkflowAndHuddleGenerator.Application.Common.Exceptions;
using AitoWorkflowAndHuddleGenerator.Application.Features.Huddles.Catalog.Common;
using AitoWorkflowAndHuddleGenerator.Contracts.Huddles;
using AitoWorkflowAndHuddleGenerator.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AitoWorkflowAndHuddleGenerator.Application.Features.Huddles.Catalog.Queries.GetRecommendedPath;

/// <summary>
/// Handles the Get Recommended Path query.
/// </summary>
public sealed class GetRecommendedPathQueryHandler : IRequestHandler<GetRecommendedPathQuery, RecommendedHuddlePathResponse>
{
    private readonly IApplicationDbContext dbContext;
    public GetRecommendedPathQueryHandler(IApplicationDbContext dbContext) => this.dbContext = dbContext;

    /// <summary>
    /// Handles the request through the application pipeline.
    /// </summary>
    /// <remarks>
    /// The path is read from HuddlePlacements and the week is the placement's own Sequence, so W1 is
    /// the orientation placement and a role that revisits a topic keeps both weeks. The previous
    /// read grouped by topic, took seven and renumbered from two, which dropped three of ATS's
    /// eight weeks and made W1 unreachable.
    /// </remarks>
    public async Task<RecommendedHuddlePathResponse> Handle(GetRecommendedPathQuery request, CancellationToken cancellationToken)
    {
        string roleExternalId = request.RoleExternalId.Trim();
        bool roleExists = await dbContext.Roles.AsNoTracking()
            .AnyAsync(x => x.ExternalId == roleExternalId && x.IsActive, cancellationToken);
        if (!roleExists) throw new NotFoundException(HuddleMessages.ActiveRoleNotFound(roleExternalId));

        List<HuddleRolePathEntry> path = await HuddleRolePathReader.LoadWeeklyPathAsync(
            dbContext, roleExternalId, cancellationToken);

        List<HuddleTopic> topics = await HuddleTopicGraph.LoadCatalogGraphAsync(
            dbContext, path.Select(x => x.HuddleTopicId).ToList(), cancellationToken);
        IReadOnlyDictionary<int, int> activityCounts = await HuddleActivityCounts.LoadAsync(
            dbContext, topics.Select(x => x.Id).Distinct().ToList(), cancellationToken);

        List<RecommendedHuddlePathItemResponse> items = [];
        for (int index = 0; index < path.Count && index < topics.Count; index++)
            items.Add(new RecommendedHuddlePathItemResponse(
                path[index].Week,
                index + 1,
                HuddleMappings.ToCatalogItem(topics[index], activityCounts, path[index].ToSummary())));

        bool complete = HuddleRolePathReader.IsContiguousFromWeekOne(path) && items.Count == path.Count;
        string? message = complete
            ? null
            : !HuddleRolePathReader.HasWeeklyPath(path)
                ? HuddleMessages.RolePathNotConfigured(roleExternalId)
                : HuddleMessages.RolePathNotContiguous(roleExternalId, path.Count);
        return new RecommendedHuddlePathResponse(roleExternalId, complete, message, items);
    }
}
