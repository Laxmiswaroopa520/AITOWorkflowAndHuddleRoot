namespace AitoWorkflowAndHuddleGenerator.Contracts.Huddles;

/// <summary>
/// Represents the Save Huddle Plan Request API contract.
/// </summary>
public sealed record SaveHuddlePlanRequest(
    string RoleExternalId,
    string? RowVersion,
    IReadOnlyList<SaveHuddlePlanItemRequest> Items);
