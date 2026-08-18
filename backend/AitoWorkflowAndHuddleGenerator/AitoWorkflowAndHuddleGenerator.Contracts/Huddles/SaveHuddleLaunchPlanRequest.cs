namespace AitoWorkflowAndHuddleGenerator.Contracts.Huddles;

/// <summary>Defines the data used to create or update a Huddle launch plan.</summary>
public sealed record SaveHuddleLaunchPlanRequest(
    string TeamName,
    string CohortName,
    DateOnly StartDate,
    DateOnly? EndDate,
    string SponsorName,
    string Managers,
    string Facilitators,
    string ProgramLead,
    string TaskStateJson,
    string? RowVersion);
