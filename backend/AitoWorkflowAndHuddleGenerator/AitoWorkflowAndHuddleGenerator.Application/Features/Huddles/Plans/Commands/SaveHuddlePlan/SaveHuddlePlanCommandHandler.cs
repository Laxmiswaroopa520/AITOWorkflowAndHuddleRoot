using AitoWorkflowAndHuddleGenerator.Application.Abstractions.Identity;
using AitoWorkflowAndHuddleGenerator.Application.Abstractions.Persistence;
using AitoWorkflowAndHuddleGenerator.Application.Common.Exceptions;
using AitoWorkflowAndHuddleGenerator.Application.Features.Huddles.Plans.Common;
using AitoWorkflowAndHuddleGenerator.Contracts.Huddles;
using AitoWorkflowAndHuddleGenerator.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AitoWorkflowAndHuddleGenerator.Application.Features.Huddles.Plans.Commands.SaveHuddlePlan;

public sealed class SaveHuddlePlanCommandHandler(
    IApplicationDbContext dbContext,
    ICurrentUserService currentUserService)
    : IRequestHandler<SaveHuddlePlanCommand, HuddlePlanResponse>
{
    public async Task<HuddlePlanResponse> Handle(SaveHuddlePlanCommand request, CancellationToken cancellationToken)
    {
        string ownerObjectId = currentUserService.ObjectId
            ?? throw new UnauthorizedAccessException("The authenticated token does not contain an oid claim.");
        string roleExternalId = request.RoleExternalId.Trim();

        HuddleSegmentRole segmentRole = await dbContext.HuddleSegmentRoles
            .Include(item => item.Role)
            .SingleOrDefaultAsync(item => item.Role.ExternalId == roleExternalId && item.Role.IsActive, cancellationToken)
            ?? throw new NotFoundException($"Active role '{roleExternalId}' was not found.");

        List<HuddleTopic> recommended = await LoadRecommendedTopics(segmentRole.Id, cancellationToken);
        if (recommended.Count != 7)
            throw new ConflictException($"Role '{roleExternalId}' does not have exactly seven unique published recommended Huddles.");

        string[] requestedTopicIds = request.Items.Select(item => item.HuddleExternalId.Trim()).ToArray();
        List<HuddleTopic> selectedTopics = await dbContext.HuddleTopics
            .Where(topic => requestedTopicIds.Contains(topic.ExternalId) && topic.PublicationStatus == "Published")
            .ToListAsync(cancellationToken);
        if (selectedTopics.Count != 7)
            throw new NotFoundException("One or more selected Huddles are unavailable or unpublished.");

        UserHuddlePlan? plan = await dbContext.UserHuddlePlans
            .Include(item => item.Items)
            .SingleOrDefaultAsync(item => item.OwnerObjectId == ownerObjectId && item.HuddleSegmentRoleId == segmentRole.Id, cancellationToken);

        if (plan is null)
        {
            if (!string.IsNullOrWhiteSpace(request.RowVersion))
                throw new ConflictException("The Huddle plan no longer exists. Refresh and try again.");
            plan = new UserHuddlePlan
            {
                Id = Guid.NewGuid(),
                OwnerObjectId = ownerObjectId,
                HuddleSegmentRoleId = segmentRole.Id,
                Name = $"{segmentRole.DisplayName} Recommended Path",
                CreatedAtUtc = DateTimeOffset.UtcNow
            };
            dbContext.UserHuddlePlans.Add(plan);
        }
        else
        {
            if (string.IsNullOrWhiteSpace(request.RowVersion))
                throw new ConflictException("The Huddle plan changed. Refresh and try again.");
            dbContext.UserHuddlePlans.Entry(plan).Property(item => item.RowVersion).OriginalValue =
                Convert.FromBase64String(request.RowVersion);
            dbContext.UserHuddlePlanItems.RemoveRange(plan.Items);
        }

        Dictionary<string, HuddleTopic> topicsById = selectedTopics.ToDictionary(topic => topic.ExternalId, StringComparer.OrdinalIgnoreCase);
        foreach (SaveHuddlePlanItemRequest item in request.Items.OrderBy(item => item.Week))
            dbContext.UserHuddlePlanItems.Add(new UserHuddlePlanItem
            {
                UserHuddlePlanId = plan.Id,
                WeekPosition = item.Week,
                HuddleTopicId = topicsById[item.HuddleExternalId.Trim()].Id
            });

        try
        {
            await dbContext.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateConcurrencyException)
        {
            throw new ConflictException("This Huddle plan was changed by another request. Refresh and try again.");
        }
        catch (DbUpdateException)
        {
            throw new ConflictException("A Huddle plan already exists for this user and role. Refresh and try again.");
        }

        UserHuddlePlan savedPlan = await dbContext.UserHuddlePlans.AsNoTracking()
            .Include(item => item.Items).ThenInclude(item => item.HuddleTopic).ThenInclude(item => item.HuddleFocusArea)
            .Include(item => item.Items).ThenInclude(item => item.HuddleTopic).ThenInclude(item => item.TopicRoles).ThenInclude(item => item.Role)
            .Include(item => item.Items).ThenInclude(item => item.HuddleTopic).ThenInclude(item => item.TopicAgents).ThenInclude(item => item.HuddleAgent)
            .SingleAsync(item => item.Id == plan.Id && item.OwnerObjectId == ownerObjectId, cancellationToken);
        return HuddlePlanMappings.ToResponse(roleExternalId, savedPlan, recommended);
    }

    private async Task<List<HuddleTopic>> LoadRecommendedTopics(int segmentRoleId, CancellationToken cancellationToken) =>
        (await dbContext.HuddleRolePathItems.AsNoTracking()
            .Where(item => item.HuddleSegmentRoleId == segmentRoleId && item.HuddleTopic.PublicationStatus == "Published")
            .OrderBy(item => item.WeekPosition)
            .Include(item => item.HuddleTopic).ThenInclude(item => item.HuddleFocusArea)
            .Include(item => item.HuddleTopic).ThenInclude(item => item.TopicRoles).ThenInclude(item => item.Role)
            .Include(item => item.HuddleTopic).ThenInclude(item => item.TopicAgents).ThenInclude(item => item.HuddleAgent)
            .ToListAsync(cancellationToken))
        .GroupBy(item => item.HuddleTopicId).Select(group => group.First().HuddleTopic).Take(7).ToList();
}
