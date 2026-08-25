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
        // No Type filter. The workbook's Topics sheet has no Type column, and the importer writes
        // "Prescriptive" for every topic, so "Type != Foundation" excluded nothing while reading as
        // a content rule. An explicit Type filter is still honoured when a caller passes one.
        IQueryable<HuddleTopic> query = dbContext.HuddleTopics.AsNoTracking()
            .Where(x => x.PublicationStatus == "Published");

        // Additional Topics comes from the workbook's Additional_Content sheet, which is loaded as
        // placements with PathSection SEC-ADDITIONAL. Restricting by the topic's aligned-roles list
        // instead surfaced a role's own role-path topics under Additional Topics.
        string? additionalRole = Normalize(request.AdditionalContentRoleExternalId);
        List<HuddleRolePathEntry>? additional = additionalRole is not null || request.AdditionalContentOnly
            ? await HuddleRolePathReader.LoadAdditionalAsync(dbContext, additionalRole, cancellationToken)
            : null;
        if (additional is not null)
        {
            int[] additionalTopicIds = additional.Select(entry => entry.HuddleTopicId).Distinct().ToArray();
            query = query.Where(x => additionalTopicIds.Contains(x.Id));
        }

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

        List<HuddleTopic> topics = await HuddleTopicGraph.AddCatalogIncludes(query)
            .ToListAsync(cancellationToken);
        IReadOnlyDictionary<int, int> activityCounts = await HuddleActivityCounts.LoadAsync(
            dbContext, topics.Select(x => x.Id).ToList(), cancellationToken);

        // Every card names a placement, so its count always equals the placement the detail panel
        // opens. The role's own placement when a role is in scope, the topic default otherwise:
        // without this a card read 34 activities while the panel opened a 7-activity placement.
        string? countsRole = Normalize(request.PlacementRoleExternalId);
        IReadOnlyDictionary<int, HuddlePlacementSummary>? rolePlacements = additional is not null
            ? AdditionalSummaries(additional)
            : countsRole is null
                ? null
                : await HuddlePlacementLookup.LoadForRoleAsync(dbContext, countsRole, cancellationToken);
        IReadOnlyDictionary<int, HuddlePlacementSummary> defaultPlacements =
            await HuddlePlacementLookup.LoadDefaultsAsync(
                dbContext, topics.Select(x => x.Id).ToList(), cancellationToken);
        IReadOnlyDictionary<int, HuddlePlacementSummary> placements =
            HuddlePlacementLookup.WithFallback(rolePlacements, defaultPlacements);

        return topics
            .Select(x => HuddleMappings.ToCatalogItem(x, activityCounts, HuddlePlacementLookup.For(placements, x.Id)))
            .ToList();
    }

    /// <summary>
    /// One additional placement per topic, so an Additional Topics card reports that placement's own
    /// activity split and role title.
    /// </summary>
    private static IReadOnlyDictionary<int, HuddlePlacementSummary> AdditionalSummaries(
        IReadOnlyList<HuddleRolePathEntry> additional) =>
        additional
            .GroupBy(entry => entry.HuddleTopicId)
            .ToDictionary(group => group.Key, group => group.First().ToSummary());

    private static string? Normalize(string? value) => string.IsNullOrWhiteSpace(value) ? null : value.Trim();
}
