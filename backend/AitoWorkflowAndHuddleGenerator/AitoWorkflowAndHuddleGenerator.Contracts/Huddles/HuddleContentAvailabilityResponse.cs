namespace AitoWorkflowAndHuddleGenerator.Contracts.Huddles;

public sealed record HuddleContentAvailabilityResponse(bool NarrativeComplete, bool FacilitatorGuideAvailable, bool PhasesAvailable, bool ActivitiesAvailable, bool AgentsAvailable, bool ResourcesAvailable, bool ReflectionAvailable, bool CommitmentAvailable, IReadOnlyList<string> MissingFields);
