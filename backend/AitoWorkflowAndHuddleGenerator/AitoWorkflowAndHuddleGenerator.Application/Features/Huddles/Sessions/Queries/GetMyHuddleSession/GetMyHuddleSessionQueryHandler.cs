using AitoWorkflowAndHuddleGenerator.Application.Abstractions.Identity;
using AitoWorkflowAndHuddleGenerator.Application.Abstractions.Persistence;
using AitoWorkflowAndHuddleGenerator.Application.Common.Exceptions;
using AitoWorkflowAndHuddleGenerator.Application.Features.Huddles.Sessions.Common;
using AitoWorkflowAndHuddleGenerator.Contracts.Huddles;
using AitoWorkflowAndHuddleGenerator.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AitoWorkflowAndHuddleGenerator.Application.Features.Huddles.Sessions.Queries.GetMyHuddleSession;

/// <summary>
/// Handles the Get My Huddle Session query.
/// </summary>
public sealed class GetMyHuddleSessionQueryHandler(IApplicationDbContext dbContext, ICurrentUserService currentUserService)
    : IRequestHandler<GetMyHuddleSessionQuery, HuddleSessionResponse?>
{
    /// <summary>
    /// Handles the request through the application pipeline.
    /// </summary>
    public async Task<HuddleSessionResponse?> Handle(GetMyHuddleSessionQuery request, CancellationToken cancellationToken)
    {
        string ownerObjectId = currentUserService.ObjectId
            ?? throw new UnauthorizedAccessException(AuthenticationMessages.MissingObjectIdClaim);
        string externalId = request.HuddleExternalId.Trim();
        HuddleTopic topic = await dbContext.HuddleTopics.AsNoTracking()
            .SingleOrDefaultAsync(item => item.ExternalId == externalId && item.PublicationStatus == "Published", cancellationToken)
            ?? throw new NotFoundException(HuddleMessages.PublishedNotFound(externalId));
        UserHuddleSession? session = await dbContext.UserHuddleSessions.AsNoTracking()
            .Include(item => item.HuddleTopic)
            .Include(item => item.CurrentHuddlePhase)
            .Include(item => item.ActivityProgress).ThenInclude(item => item.HuddleActivity)
            .SingleOrDefaultAsync(item => item.OwnerObjectId == ownerObjectId && item.HuddleTopicId == topic.Id, cancellationToken);
        if (session is null) return null;
        List<HuddleActivity> validActivities = await dbContext.HuddleActivities.AsNoTracking()
            .Where(activity => activity.HuddleTopicId == topic.Id).ToListAsync(cancellationToken);
        return HuddleSessionMappings.ToResponse(session, validActivities);
    }
}
