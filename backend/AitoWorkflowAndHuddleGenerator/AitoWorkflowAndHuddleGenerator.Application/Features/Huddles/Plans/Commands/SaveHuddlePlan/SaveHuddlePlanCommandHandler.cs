using AitoWorkflowAndHuddleGenerator.Application.Abstractions.Identity;
using AitoWorkflowAndHuddleGenerator.Application.Abstractions.Persistence;
using AitoWorkflowAndHuddleGenerator.Application.Common.Exceptions;
using AitoWorkflowAndHuddleGenerator.Application.Features.Huddles.Catalog.Common;
using AitoWorkflowAndHuddleGenerator.Application.Features.Huddles.Plans.Common;
using AitoWorkflowAndHuddleGenerator.Contracts.Huddles;
using AitoWorkflowAndHuddleGenerator.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AitoWorkflowAndHuddleGenerator.Application.Features.Huddles.Plans.Commands.SaveHuddlePlan;

/// <summary>
/// Handles the Save Huddle Plan command.
/// </summary>
public sealed class SaveHuddlePlanCommandHandler(
    IApplicationDbContext dbContext,
    ICurrentUserService currentUserService)
    : IRequestHandler<SaveHuddlePlanCommand, HuddlePlanResponse>
{
    /// <summary>
    /// Handles the request through the application pipeline.
    /// </summary>
    public async Task<HuddlePlanResponse> Handle(SaveHuddlePlanCommand request, CancellationToken cancellationToken)
    {
        string ownerObjectId = currentUserService.ObjectId
            ?? throw new UnauthorizedAccessException(AuthenticationMessages.MissingObjectIdClaim);
        string roleExternalId = request.RoleExternalId.Trim();

        HuddleSegmentRole segmentRole = await dbContext.HuddleSegmentRoles
            .Include(item => item.Role)
            .SingleOrDefaultAsync(item => item.Role.ExternalId == roleExternalId && item.Role.IsActive, cancellationToken)
            ?? throw new NotFoundException(HuddleMessages.ActiveRoleNotFound(roleExternalId));

        List<HuddleTopic> recommended = await LoadRecommendedTopics(segmentRole.Id, cancellationToken);
        if (recommended.Count != 7)
            throw new ConflictException(HuddleMessages.RecommendedPathIncomplete(roleExternalId));

        string[] requestedTopicIds = request.Items.Select(item => item.HuddleExternalId.Trim()).ToArray();
        List<HuddleTopic> selectedTopics = await dbContext.HuddleTopics
            .Where(topic => requestedTopicIds.Contains(topic.ExternalId) && topic.PublicationStatus == "Published")
            .ToListAsync(cancellationToken);
        if (selectedTopics.Count != 7)
            throw new NotFoundException(HuddleMessages.SelectedHuddlesUnavailable);

        UserHuddlePlan? plan = await dbContext.UserHuddlePlans
            .Include(item => item.Items)
            .SingleOrDefaultAsync(item => item.OwnerObjectId == ownerObjectId && item.HuddleSegmentRoleId == segmentRole.Id, cancellationToken);

        if (plan is null)
        {
            if (!string.IsNullOrWhiteSpace(request.RowVersion))
                throw new ConflictException(HuddleMessages.PlanNoLongerExists);
            plan = new UserHuddlePlan
            {
                Id = Guid.NewGuid(),
                OwnerObjectId = ownerObjectId,
                HuddleSegmentRoleId = segmentRole.Id,
                Name = $"{segmentRole.DisplayName} Role Path",
                CreatedAtUtc = DateTimeOffset.UtcNow
            };
            dbContext.UserHuddlePlans.Add(plan);
        }
        else
        {
            if (string.IsNullOrWhiteSpace(request.RowVersion))
                throw new ConflictException(HuddleMessages.PlanChanged);
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
            throw new ConflictException(HuddleMessages.PlanChangedByAnotherRequest);
        }
        catch (DbUpdateException)
        {
            throw new ConflictException(HuddleMessages.PlanAlreadyExists);
        }

        UserHuddlePlan savedPlan = await dbContext.UserHuddlePlans.AsNoTracking()
            .Include(item => item.Items).ThenInclude(item => item.HuddleTopic).ThenInclude(item => item.HuddleFocusArea)
            .Include(item => item.Items).ThenInclude(item => item.HuddleTopic).ThenInclude(item => item.TopicRoles).ThenInclude(item => item.Role)
            .Include(item => item.Items).ThenInclude(item => item.HuddleTopic).ThenInclude(item => item.TopicAgents).ThenInclude(item => item.HuddleAgent)
            .Include(item => item.Items).ThenInclude(item => item.HuddleTopic).ThenInclude(item => item.McemStages).ThenInclude(item => item.HuddleMcemStage)
            .SingleAsync(item => item.Id == plan.Id && item.OwnerObjectId == ownerObjectId, cancellationToken);
        IReadOnlyDictionary<int, int> activityCounts = await HuddleActivityCounts.LoadAsync(
            dbContext,
            recommended.Select(item => item.Id)
                .Concat(savedPlan.Items.Select(item => item.HuddleTopicId))
                .Distinct().ToList(),
            cancellationToken);
        return HuddlePlanMappings.ToResponse(roleExternalId, savedPlan, recommended, activityCounts);
    }

    private async Task<List<HuddleTopic>> LoadRecommendedTopics(int segmentRoleId, CancellationToken cancellationToken) =>
        (await dbContext.HuddleRolePathItems.AsNoTracking()
            .Where(item => item.HuddleSegmentRoleId == segmentRoleId && item.HuddleTopic.PublicationStatus == "Published")
            .OrderBy(item => item.WeekPosition)
            .Include(item => item.HuddleTopic).ThenInclude(item => item.HuddleFocusArea)
            .Include(item => item.HuddleTopic).ThenInclude(item => item.TopicRoles).ThenInclude(item => item.Role)
            .Include(item => item.HuddleTopic).ThenInclude(item => item.TopicAgents).ThenInclude(item => item.HuddleAgent)
            .Include(item => item.HuddleTopic).ThenInclude(item => item.McemStages).ThenInclude(item => item.HuddleMcemStage)
            .ToListAsync(cancellationToken))
        .GroupBy(item => item.HuddleTopicId).Select(group => group.First().HuddleTopic).Take(7).ToList();
}
