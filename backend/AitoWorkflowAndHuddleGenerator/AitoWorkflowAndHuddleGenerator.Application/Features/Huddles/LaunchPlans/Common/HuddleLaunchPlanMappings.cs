using AitoWorkflowAndHuddleGenerator.Contracts.Huddles;
using AitoWorkflowAndHuddleGenerator.Domain.Entities;

namespace AitoWorkflowAndHuddleGenerator.Application.Features.Huddles.LaunchPlans.Common;

/// <summary>Maps persisted launch plans to API contracts.</summary>
public static class HuddleLaunchPlanMappings
{
    /// <summary>Maps a launch-plan entity to its response contract.</summary>
    public static HuddleLaunchPlanResponse ToResponse(UserHuddleLaunchPlan plan) => new(
        plan.TeamName, plan.CohortName, plan.StartDate, plan.EndDate, plan.SponsorName,
        plan.Managers, plan.Facilitators, plan.ProgramLead, plan.TaskStateJson,
        Convert.ToBase64String(plan.RowVersion));
}
