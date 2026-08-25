namespace AitoWorkflowAndHuddleGenerator.Contracts.Huddles;

/// <summary>
/// Represents the Huddle Detail Response API contract.
/// </summary>
public sealed record HuddleDetailResponse(
    /// <summary>Placement this detail was read for, or null for a topic-scoped read.</summary>
    string? PlacementExternalId,
    /// <summary>Role-facing title from the placement, which differs from the topic name.</summary>
    string? RoleTopicName,
    string? RoleTopicDescription,
    /// <summary>What's in it for me, from the placement.</summary>
    string? Wiifm,
    string ExternalId, string Name, string? Description, string Type, string PublicationStatus, string? FocusAreaExternalId, string? FocusAreaName, int? DurationMinutes, int? RecommendationPriority, IReadOnlyList<HuddleRoleResponse> Roles, string? AudienceDescription, string? TodayObjective, string? UseCase, string? WhyItMatters, string? DesiredOutcome, IReadOnlyList<string> StepsToGetStarted, IReadOnlyList<HuddleMcemStageResponse> McemStages, IReadOnlyList<HuddleAgentResponse> PrimaryAgents, IReadOnlyList<HuddleAgentResponse> SecondaryAgents, IReadOnlyList<HuddlePhaseResponse> Phases, HuddleFacilitatorGuideResponse? FacilitatorGuide, IReadOnlyList<HuddleResourceResponse> TopicResources, string? ReflectionPrompt, string? CommitmentPrompt, string? KeyTakeaway, HuddleContentAvailabilityResponse ContentAvailability);
