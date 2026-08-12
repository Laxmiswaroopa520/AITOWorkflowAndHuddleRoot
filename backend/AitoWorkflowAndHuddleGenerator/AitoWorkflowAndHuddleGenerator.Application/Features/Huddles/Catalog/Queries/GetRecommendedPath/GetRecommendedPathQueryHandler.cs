using AitoWorkflowAndHuddleGenerator.Application.Abstractions.Persistence;
using AitoWorkflowAndHuddleGenerator.Application.Common.Exceptions;
using AitoWorkflowAndHuddleGenerator.Application.Features.Huddles.Catalog.Common;
using AitoWorkflowAndHuddleGenerator.Contracts.Huddles;
using AitoWorkflowAndHuddleGenerator.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AitoWorkflowAndHuddleGenerator.Application.Features.Huddles.Catalog.Queries.GetRecommendedPath;

public sealed class GetRecommendedPathQueryHandler : IRequestHandler<GetRecommendedPathQuery, RecommendedHuddlePathResponse>
{
    private readonly IApplicationDbContext _dbContext;
    public GetRecommendedPathQueryHandler(IApplicationDbContext dbContext) => _dbContext = dbContext;

    public async Task<RecommendedHuddlePathResponse> Handle(GetRecommendedPathQuery request, CancellationToken cancellationToken)
    {
        string roleExternalId = request.RoleExternalId.Trim();
        bool roleExists = await _dbContext.Roles.AsNoTracking().AnyAsync(x => x.ExternalId == roleExternalId && x.IsActive, cancellationToken);
        if (!roleExists) throw new NotFoundException($"Active role '{roleExternalId}' was not found.");

        List<HuddleRolePathItem> path = await _dbContext.HuddleRolePathItems.AsNoTracking()
            .Where(x => x.HuddleSegmentRole.Role.ExternalId == roleExternalId && x.HuddleTopic.PublicationStatus == "Published" && x.HuddleTopic.Type != "Foundation")
            .OrderBy(x => x.WeekPosition)
            .Include(x => x.HuddleSegmentRole).ThenInclude(x => x.Role)
            .Include(x => x.HuddleTopic).ThenInclude(x => x.HuddleFocusArea)
            .Include(x => x.HuddleTopic).ThenInclude(x => x.TopicRoles).ThenInclude(x => x.Role)
            .Include(x => x.HuddleTopic).ThenInclude(x => x.TopicAgents).ThenInclude(x => x.HuddleAgent)
            .ToListAsync(cancellationToken);

        List<HuddleRolePathItem> unique = path.GroupBy(x => x.HuddleTopicId).Select(x => x.First()).OrderBy(x => x.WeekPosition).Take(7).ToList();
        bool complete = unique.Count == 7;
        List<RecommendedHuddlePathItemResponse> items = unique.Select((x, index) =>
            new RecommendedHuddlePathItemResponse(6 + index, index + 1, HuddleMappings.ToCatalogItem(x.HuddleTopic))).ToList();
        string? message = complete ? null : $"Recommended Path requires seven unique published Huddles, but only {unique.Count} eligible Huddles are configured for role '{roleExternalId}'.";
        return new RecommendedHuddlePathResponse(roleExternalId, complete, message, items);
    }
}
