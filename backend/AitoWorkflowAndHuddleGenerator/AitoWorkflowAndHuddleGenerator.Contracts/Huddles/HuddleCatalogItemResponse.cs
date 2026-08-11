namespace AitoWorkflowAndHuddleGenerator.Contracts.Huddles;

public sealed record HuddleCatalogItemResponse(string ExternalId, string Name, string? Description, string Type, string? FocusAreaExternalId, string? FocusAreaName, int? DurationMinutes, int? RecommendationPriority, string? AudienceDescription, string? DesiredOutcome, IReadOnlyList<HuddleRoleResponse> Roles, IReadOnlyList<HuddleAgentResponse> PrimaryAgents, IReadOnlyList<HuddleAgentResponse> SecondaryAgents);
