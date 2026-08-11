using AitoWorkflowAndHuddleGenerator.Application.Abstractions.Persistence;
using AitoWorkflowAndHuddleGenerator.Application.Common.Exceptions;
using AitoWorkflowAndHuddleGenerator.Application.Features.Huddles.Catalog.Common;
using AitoWorkflowAndHuddleGenerator.Contracts.Huddles;
using AitoWorkflowAndHuddleGenerator.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AitoWorkflowAndHuddleGenerator.Application.Features.Huddles.Catalog.Queries.GetHuddleById;

public sealed class GetHuddleByIdQueryHandler : IRequestHandler<GetHuddleByIdQuery, HuddleDetailResponse>
{
    private readonly IApplicationDbContext _dbContext;
    public GetHuddleByIdQueryHandler(IApplicationDbContext dbContext) => _dbContext = dbContext;

    public async Task<HuddleDetailResponse> Handle(GetHuddleByIdQuery request, CancellationToken cancellationToken)
    {
        string externalId = request.ExternalId.Trim();
        HuddleTopic? topic = await _dbContext.HuddleTopics.AsNoTracking()
            .Where(x => x.ExternalId == externalId && x.PublicationStatus == "Published")
            .Include(x => x.HuddleFocusArea)
            .Include(x => x.TopicRoles).ThenInclude(x => x.Role)
            .Include(x => x.McemStages).ThenInclude(x => x.HuddleMcemStage)
            .Include(x => x.TopicAgents).ThenInclude(x => x.HuddleAgent)
            .Include(x => x.TopicResources).ThenInclude(x => x.HuddleResource)
            .Include(x => x.FacilitatorGuide)
            .Include(x => x.Phases).ThenInclude(x => x.Activities).ThenInclude(x => x.ActivityAgents).ThenInclude(x => x.HuddleAgent)
            .Include(x => x.Phases).ThenInclude(x => x.Activities).ThenInclude(x => x.ActivityResources).ThenInclude(x => x.HuddleResource)
            .SingleOrDefaultAsync(cancellationToken);
        if (topic is null)
            throw new NotFoundException($"Published Huddle '{externalId}' was not found.");

        //it collects all agent ids
        int[] agentIds = topic.TopicAgents.Select(x => x.HuddleAgentId)             //gets agents attached directly to the huddle
            .Concat(topic.Activities.SelectMany(x => x.ActivityAgents).Select(x => x.HuddleAgentId)).Distinct().ToArray();          //also gets agents attached to individual activities     // so conceptually ;((huddle-level agents+ activity-level agetns==== all agent IDs))
        List<HuddleAgentResource> links = await _dbContext.HuddleAgentResources.AsNoTracking()
            .Where(x => agentIds.Contains(x.HuddleAgentId)).Include(x => x.HuddleResource).ToListAsync(cancellationToken);
        IReadOnlyDictionary<int, IReadOnlyList<HuddleResourceResponse>> resources = links.GroupBy(x => x.HuddleAgentId)
            .ToDictionary(x => x.Key, x => (IReadOnlyList<HuddleResourceResponse>)x.OrderBy(y => y.DisplayOrder)
                .Select(y => HuddleMappings.ToResource(y.HuddleResource, y.DisplayOrder)).ToList());
        return HuddleMappings.ToDetail(topic, resources);
    }
}
