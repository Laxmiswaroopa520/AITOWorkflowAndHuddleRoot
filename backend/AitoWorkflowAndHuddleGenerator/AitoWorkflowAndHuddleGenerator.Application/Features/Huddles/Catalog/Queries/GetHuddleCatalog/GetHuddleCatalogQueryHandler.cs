using AitoWorkflowAndHuddleGenerator.Application.Abstractions.Persistence;
using AitoWorkflowAndHuddleGenerator.Application.Features.Huddles.Catalog.Common;
using AitoWorkflowAndHuddleGenerator.Contracts.Huddles;
using AitoWorkflowAndHuddleGenerator.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AitoWorkflowAndHuddleGenerator.Application.Features.Huddles.Catalog.Queries.GetHuddleCatalog;

/// <summary>
/// Handles the Get Huddle Catalog query.
/// </summary>
public sealed class GetHuddleCatalogQueryHandler : IRequestHandler<GetHuddleCatalogQuery, IReadOnlyList<HuddleCatalogItemResponse>>
{
    private readonly IApplicationDbContext dbContext;
    public GetHuddleCatalogQueryHandler(IApplicationDbContext dbContext) => this.dbContext = dbContext;

    /// <summary>
    /// Handles the request through the application pipeline.
    /// </summary>

    public async Task<IReadOnlyList<HuddleCatalogItemResponse>> Handle(GetHuddleCatalogQuery request, CancellationToken cancellationToken)
    {
        IQueryable<HuddleTopic> query = dbContext.HuddleTopics.AsNoTracking()
            .Where(x => x.PublicationStatus == "Published" && x.Type != "Foundation");

        string? role = Normalize(request.RoleExternalId);
        string? focus = Normalize(request.FocusAreaExternalId);
        string? agent = Normalize(request.AgentExternalId);
        string? type = Normalize(request.Type);
        string? search = Normalize(request.Search);
        if (role is not null) query = query.Where(x => x.TopicRoles.Any(r => r.Role.ExternalId == role));
        if (focus is not null) query = query.Where(x => x.HuddleFocusArea != null && x.HuddleFocusArea.ExternalId == focus);
        if (agent is not null) query = query.Where(x => x.TopicAgents.Any(a => a.HuddleAgent.ExternalId == agent) || x.Activities.Any(a => a.ActivityAgents.Any(m => m.HuddleAgent.ExternalId == agent)));
        if (type is not null) query = query.Where(x => x.Type == type);
        if (search is not null) query = query.Where(x => x.Name.Contains(search) || (x.Description != null && x.Description.Contains(search)));

        string sort = Normalize(request.Sort)?.ToLowerInvariant() ?? "default";
        query = sort switch
        {
            "name" => query.OrderBy(x => x.Name),
            "priority" => query.OrderBy(x => x.RecommendationPriority ?? int.MaxValue).ThenBy(x => x.Name),
            "most-upvoted" => query.OrderByDescending(x => dbContext.HuddleVotes.Count(v => v.HuddleTopicId == x.Id && (int)v.Value == 1) - dbContext.HuddleVotes.Count(v => v.HuddleTopicId == x.Id && (int)v.Value == -1)).ThenBy(x => x.Name),
            "role-relevance" when role is not null => query.OrderBy(x => dbContext.HuddleRolePathItems.Where(p => p.HuddleTopicId == x.Id && p.HuddleSegmentRole.Role.ExternalId == role).Select(p => (int?)p.WeekPosition).Min() ?? int.MaxValue).ThenBy(x => x.Name),
            _ => query.OrderBy(x => x.RecommendationPriority ?? int.MaxValue).ThenBy(x => x.Name)
        };

        List<HuddleTopic> topics = await AddCatalogIncludes(query)
            .ToListAsync(cancellationToken);
        return topics.Select(HuddleMappings.ToCatalogItem).ToList();
    }

    internal static IQueryable<HuddleTopic> AddCatalogIncludes(IQueryable<HuddleTopic> query) => query
        .Include(x => x.HuddleFocusArea)
        .Include(x => x.TopicRoles).ThenInclude(x => x.Role)
        .Include(x => x.TopicAgents).ThenInclude(x => x.HuddleAgent);

    private static string? Normalize(string? value) => string.IsNullOrWhiteSpace(value) ? null : value.Trim();
}
