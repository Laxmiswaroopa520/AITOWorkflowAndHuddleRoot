namespace AitoWorkflowAndHuddleGenerator.Contracts.Huddles;

/// <summary>
/// Represents the Huddle Catalog Item Response API contract.
/// </summary>
public sealed record HuddleCatalogItemResponse(string ExternalId, string Name, string? Description, string Type, string? FocusAreaExternalId, string? FocusAreaName, int? DurationMinutes, int? RecommendationPriority, string? AudienceDescription, string? DesiredOutcome, IReadOnlyList<HuddleRoleResponse> Roles, IReadOnlyList<HuddleAgentResponse> PrimaryAgents, IReadOnlyList<HuddleAgentResponse> SecondaryAgents, IReadOnlyList<HuddleMcemStageResponse> McemStages, int ActivityCount,
    /// <summary>Placement to open for this catalogue entry, when the item came from a role path.</summary>
    string? PlacementExternalId = null,
    /// <summary>Featured activity count for the placement. Falls back to ActivityCount when unscoped.</summary>
    int? FeaturedActivityCount = null,
    int? ExtendedActivityCount = null,
    /// <summary>
    /// The role-facing title for this placement, from Role_Paths.RoleTopicName. Null for an
    /// unscoped card, where only the generic topic name applies.
    /// </summary>
    string? RoleTopicName = null,
    /// <summary>
    /// The role-facing description for this placement, from Role_Paths.RoleTopicDescription.
    /// </summary>
    string? RoleTopicDescription = null);
