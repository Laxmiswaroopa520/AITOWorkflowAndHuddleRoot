namespace AitoWorkflowAndHuddleGenerator.Contracts.Huddles;

/// <summary>Represents the authenticated user's persisted Huddle launch plan.</summary>
public sealed record HuddleLaunchPlanResponse(
    string TeamName,
    string CohortName,
    DateOnly StartDate,
    DateOnly? EndDate,
    string SponsorName,
    string Managers,
    string Facilitators,
    string ProgramLead,
    string TaskStateJson,
    string RowVersion);
