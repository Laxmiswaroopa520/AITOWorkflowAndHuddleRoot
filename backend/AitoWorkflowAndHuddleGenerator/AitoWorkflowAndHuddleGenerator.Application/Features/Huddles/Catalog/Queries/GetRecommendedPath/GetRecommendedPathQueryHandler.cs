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

    public async Task<RecommendedHuddlePathResponse> Handle(GetRecommendedPathQuery request, CancellationToken cancellationToken)
    {
        string roleExternalId = request.RoleExternalId.Trim();
        bool roleExists = await dbContext.Roles.AsNoTracking().AnyAsync(x => x.ExternalId == roleExternalId && x.IsActive, cancellationToken);
        if (!roleExists) throw new NotFoundException(HuddleMessages.ActiveRoleNotFound(roleExternalId));

        List<HuddleRolePathItem> path = await dbContext.HuddleRolePathItems.AsNoTracking()
            .Where(x => x.HuddleSegmentRole.Role.ExternalId == roleExternalId && x.HuddleTopic.PublicationStatus == "Published" && x.HuddleTopic.Type != "Foundation")
            .OrderBy(x => x.WeekPosition)
            .Include(x => x.HuddleSegmentRole).ThenInclude(x => x.Role)
            .Include(x => x.HuddleTopic).ThenInclude(x => x.HuddleFocusArea)
            .Include(x => x.HuddleTopic).ThenInclude(x => x.TopicRoles).ThenInclude(x => x.Role)
            .Include(x => x.HuddleTopic).ThenInclude(x => x.TopicAgents).ThenInclude(x => x.HuddleAgent)
            .Include(x => x.HuddleTopic).ThenInclude(x => x.McemStages).ThenInclude(x => x.HuddleMcemStage)
            .ToListAsync(cancellationToken);

        List<HuddleRolePathItem> unique = path.GroupBy(x => x.HuddleTopicId).Select(x => x.First()).OrderBy(x => x.WeekPosition).Take(7).ToList();
        bool complete = unique.Count == 7;
        IReadOnlyDictionary<int, int> activityCounts = await HuddleActivityCounts.LoadAsync(
            dbContext, unique.Select(x => x.HuddleTopicId).ToList(), cancellationToken);
        List<RecommendedHuddlePathItemResponse> items = unique.Select((x, index) =>
            new RecommendedHuddlePathItemResponse(2 + index, index + 1, HuddleMappings.ToCatalogItem(x.HuddleTopic, activityCounts))).ToList();
        string? message = complete ? null : $"Role Path requires seven unique published Huddles, but only {unique.Count} eligible Huddles are configured for role '{roleExternalId}'.";
        return new RecommendedHuddlePathResponse(roleExternalId, complete, message, items);
    }
}
