using AitoWorkflowAndHuddleGenerator.Contracts.Huddles;
using MediatR;

namespace AitoWorkflowAndHuddleGenerator.Application.Features.Huddles.LaunchPlans.Commands.SaveHuddleLaunchPlan;

/// <summary>Creates or updates the authenticated user's Huddle launch plan.</summary>
public sealed record SaveHuddleLaunchPlanCommand(
    string TeamName, string CohortName, DateOnly StartDate, DateOnly? EndDate,
    string SponsorName, string Managers, string Facilitators, string ProgramLead,
    string TaskStateJson, string? RowVersion) : IRequest<HuddleLaunchPlanResponse>;
