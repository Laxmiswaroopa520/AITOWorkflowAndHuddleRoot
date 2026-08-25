using AitoWorkflowAndHuddleGenerator.Application.Abstractions.Persistence;
using AitoWorkflowAndHuddleGenerator.Application.Common.Exceptions;
using AitoWorkflowAndHuddleGenerator.Application.Features.Huddles.Catalog.Common;
using AitoWorkflowAndHuddleGenerator.Contracts.Huddles;
using AitoWorkflowAndHuddleGenerator.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AitoWorkflowAndHuddleGenerator.Application.Features.Huddles.Catalog.Queries.GetHuddleById;

/// <summary>
/// Handles the Get Huddle By Id query.
/// </summary>
public sealed class GetHuddleByIdQueryHandler : IRequestHandler<GetHuddleByIdQuery, HuddleDetailResponse>
{
    private readonly IApplicationDbContext dbContext;
    public GetHuddleByIdQueryHandler(IApplicationDbContext dbContext) => this.dbContext = dbContext;

    /// <summary>
    /// Handles the request through the application pipeline.
    /// </summary>

    public async Task<HuddleDetailResponse> Handle(GetHuddleByIdQuery request, CancellationToken cancellationToken)
    {
        string externalId = request.ExternalId.Trim();
        string? placementExternalId = request.PlacementExternalId?.Trim();
        HuddleTopic? topic = await dbContext.HuddleTopics.AsNoTracking()
            // No Type filter: the workbook has no Type column and the importer writes "Prescriptive"
            // for every topic, so this excluded nothing while blocking the orientation topic in
            // principle. W1 of every role path is the orientation placement and must open.
            .Where(x => x.ExternalId == externalId && x.PublicationStatus == "Published")
            .Include(x => x.HuddleFocusArea)
            .Include(x => x.TopicRoles).ThenInclude(x => x.Role)
            .Include(x => x.McemStages).ThenInclude(x => x.HuddleMcemStage)
            .Include(x => x.TopicAgents).ThenInclude(x => x.HuddleAgent)
            .Include(x => x.TopicResources).ThenInclude(x => x.HuddleResource)
            .SingleOrDefaultAsync(cancellationToken);
        if (topic is null)
            throw new NotFoundException(HuddleMessages.PublishedNotFound(externalId));

        // Phases, activities and the facilitator guide are loaded separately, scoped to the
        // placement when one was requested. Loading them through the topic would aggregate every
        // role that shares it: WF-X-PIPE-01 sits on three placements, so a topic-scoped read
        // returns nine phases and fourteen activities instead of three and six.
        // Split into one statement per collection. AsSplitQuery is not called here because that
        // extension is relational-only (Microsoft.EntityFrameworkCore.Relational) and this project
        // references the provider-agnostic core, so the behaviour is set once on the DbContext in
        // Infrastructure instead. Without it this include tree repeats the phase and activity
        // narrative once per agent and resource combination.
        // Never aggregate. With no placement named this used to read through the topic, and a
        // topic on seven placements came back with 21 phases and 34 activities, which is not a
        // Huddle anyone can run. Resolve the topic's default placement instead; only pre-V4 topics
        // that have no placements at all fall through to the topic-scoped read below.
        if (string.IsNullOrWhiteSpace(placementExternalId))
            placementExternalId = await HuddlePlacementLookup.ResolveDefaultExternalIdAsync(
                dbContext, topic.Id, cancellationToken);

        HuddlePlacement? placement = null;
        if (!string.IsNullOrWhiteSpace(placementExternalId))
        {
            placement = await dbContext.HuddlePlacements.AsNoTracking()
                .Where(x => x.ExternalId == placementExternalId && x.HuddleTopicId == topic.Id && x.IsActive)
                .Include(x => x.FacilitatorGuide)
                .Include(x => x.Phases).ThenInclude(x => x.Activities).ThenInclude(x => x.PrerequisiteHuddleActivity)
                .Include(x => x.Phases).ThenInclude(x => x.Activities).ThenInclude(x => x.ActivityAgents).ThenInclude(x => x.HuddleAgent)
                .Include(x => x.Phases).ThenInclude(x => x.Activities).ThenInclude(x => x.ActivityResources).ThenInclude(x => x.HuddleResource)
                .SingleOrDefaultAsync(cancellationToken);
            if (placement is null)
                throw new NotFoundException(HuddleMessages.PlacementNotFound(placementExternalId!, externalId));
        }
        else
        {
            // Reached only when the topic has no placements, which means pre-V4 seed content.
            topic = await dbContext.HuddleTopics.AsNoTracking()
                .Where(x => x.Id == topic.Id)
                .Include(x => x.HuddleFocusArea)
                .Include(x => x.TopicRoles).ThenInclude(x => x.Role)
                .Include(x => x.McemStages).ThenInclude(x => x.HuddleMcemStage)
                .Include(x => x.TopicAgents).ThenInclude(x => x.HuddleAgent)
                .Include(x => x.TopicResources).ThenInclude(x => x.HuddleResource)
                .Include(x => x.FacilitatorGuides)
                .Include(x => x.Phases).ThenInclude(x => x.Activities).ThenInclude(x => x.PrerequisiteHuddleActivity)
                .Include(x => x.Phases).ThenInclude(x => x.Activities).ThenInclude(x => x.ActivityAgents).ThenInclude(x => x.HuddleAgent)
                .Include(x => x.Phases).ThenInclude(x => x.Activities).ThenInclude(x => x.ActivityResources).ThenInclude(x => x.HuddleResource)
                .SingleAsync(cancellationToken);
        }

        // Agent resources for every agent referenced by the Huddle or by the activities in scope.
        IEnumerable<HuddleActivity> activitiesInScope = placement is null
            ? topic.Phases.SelectMany(x => x.Activities)
            : placement.Phases.SelectMany(x => x.Activities);
        int[] agentIds = topic.TopicAgents.Select(x => x.HuddleAgentId)
            .Concat(activitiesInScope.SelectMany(x => x.ActivityAgents).Select(x => x.HuddleAgentId))
            .Distinct().ToArray();
        List<HuddleAgentResource> links = await dbContext.HuddleAgentResources.AsNoTracking()
            .Where(x => agentIds.Contains(x.HuddleAgentId)).Include(x => x.HuddleResource).ToListAsync(cancellationToken);
        IReadOnlyDictionary<int, IReadOnlyList<HuddleResourceResponse>> resources = links.GroupBy(x => x.HuddleAgentId)
            .ToDictionary(x => x.Key, x => (IReadOnlyList<HuddleResourceResponse>)x.OrderBy(y => y.DisplayOrder)
                .Select(y => HuddleMappings.ToResource(y.HuddleResource, y.DisplayOrder)).ToList());
        return HuddleMappings.ToDetail(topic, resources, placement);
    }
}
