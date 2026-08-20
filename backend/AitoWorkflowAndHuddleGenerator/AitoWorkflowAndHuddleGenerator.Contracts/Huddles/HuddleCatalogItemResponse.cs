namespace AitoWorkflowAndHuddleGenerator.Contracts.Huddles;

/// <summary>
/// Represents the Huddle Catalog Item Response API contract.
/// </summary>
public sealed record HuddleCatalogItemResponse(string ExternalId, string Name, string? Description, string Type, string? FocusAreaExternalId, string? FocusAreaName, int? DurationMinutes, int? RecommendationPriority, string? AudienceDescription, string? DesiredOutcome, IReadOnlyList<HuddleRoleResponse> Roles, IReadOnlyList<HuddleAgentResponse> PrimaryAgents, IReadOnlyList<HuddleAgentResponse> SecondaryAgents, IReadOnlyList<HuddleMcemStageResponse> McemStages, int ActivityCount);
