using AitoWorkflowAndHuddleGenerator.Application.Abstractions.Identity;
using AitoWorkflowAndHuddleGenerator.Application.Abstractions.Persistence;
using AitoWorkflowAndHuddleGenerator.Application.Common.Exceptions;
using AitoWorkflowAndHuddleGenerator.Application.Features.Huddles.LaunchPlans.Common;
using AitoWorkflowAndHuddleGenerator.Contracts.Huddles;
using AitoWorkflowAndHuddleGenerator.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AitoWorkflowAndHuddleGenerator.Application.Features.Huddles.LaunchPlans.Commands.SaveHuddleLaunchPlan;

/// <summary>Persists an authenticated launch plan with optimistic concurrency.</summary>
public sealed class SaveHuddleLaunchPlanCommandHandler(IApplicationDbContext dbContext, ICurrentUserService currentUserService)
    : IRequestHandler<SaveHuddleLaunchPlanCommand, HuddleLaunchPlanResponse>
{
    /// <summary>Handles the save command through the application pipeline.</summary>
    public async Task<HuddleLaunchPlanResponse> Handle(SaveHuddleLaunchPlanCommand request, CancellationToken cancellationToken)
    {
        string ownerObjectId = currentUserService.ObjectId
            ?? throw new UnauthorizedAccessException(AuthenticationMessages.MissingObjectIdClaim);
        UserHuddleLaunchPlan? plan = await dbContext.UserHuddleLaunchPlans
            .SingleOrDefaultAsync(item => item.OwnerObjectId == ownerObjectId, cancellationToken);
        DateTimeOffset now = DateTimeOffset.UtcNow;
        if (plan is null)
        {
            if (!string.IsNullOrWhiteSpace(request.RowVersion)) throw new ConflictException(HuddleMessages.LaunchPlanChanged);
            plan = new UserHuddleLaunchPlan { Id = Guid.NewGuid(), OwnerObjectId = ownerObjectId, CreatedAtUtc = now };
            dbContext.UserHuddleLaunchPlans.Add(plan);
        }
        else
        {
            if (string.IsNullOrWhiteSpace(request.RowVersion)) throw new ConflictException(HuddleMessages.LaunchPlanChanged);
            try { dbContext.UserHuddleLaunchPlans.Entry(plan).Property(item => item.RowVersion).OriginalValue = Convert.FromBase64String(request.RowVersion); }
            catch (FormatException) { throw new ConflictException(HuddleMessages.LaunchPlanChanged); }
            plan.UpdatedAtUtc = now;
        }
        plan.TeamName = request.TeamName.Trim(); plan.CohortName = request.CohortName.Trim();
        plan.StartDate = request.StartDate; plan.EndDate = request.EndDate;
        plan.SponsorName = request.SponsorName.Trim(); plan.Managers = request.Managers.Trim();
        plan.Facilitators = request.Facilitators.Trim(); plan.ProgramLead = request.ProgramLead.Trim();
        plan.TaskStateJson = request.TaskStateJson;
        try { await dbContext.SaveChangesAsync(cancellationToken); }
        catch (DbUpdateConcurrencyException) { throw new ConflictException(HuddleMessages.LaunchPlanChangedByAnotherRequest); }
        catch (DbUpdateException) { throw new ConflictException(HuddleMessages.LaunchPlanAlreadyExists); }
        return HuddleLaunchPlanMappings.ToResponse(plan);
    }
}
