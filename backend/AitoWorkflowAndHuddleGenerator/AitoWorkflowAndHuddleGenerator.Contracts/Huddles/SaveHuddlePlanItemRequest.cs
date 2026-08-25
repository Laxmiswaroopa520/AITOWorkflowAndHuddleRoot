namespace AitoWorkflowAndHuddleGenerator.Contracts.Huddles;

/// <summary>
/// Represents the Save Huddle Plan Item Request API contract.
/// </summary>
/// <param name="Week">The week on the role path, numbered from 1.</param>
/// <param name="HuddleExternalId">The topic to place in this week.</param>
/// <param name="PlacementExternalId">
/// Which placement of that topic the week uses. Required to distinguish two weeks that share a
/// topic, such as AE weeks 3 and 4. Optional so existing callers keep working, in which case the
/// role path's own placement for that week is used.
/// </param>
public sealed record SaveHuddlePlanItemRequest(
    int Week,
    string HuddleExternalId,
    string? PlacementExternalId = null);
