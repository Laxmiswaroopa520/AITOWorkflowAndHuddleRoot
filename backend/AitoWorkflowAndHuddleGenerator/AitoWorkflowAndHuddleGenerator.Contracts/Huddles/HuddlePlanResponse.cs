namespace AitoWorkflowAndHuddleGenerator.Contracts.Huddles;

/// <summary>
/// Represents the Huddle Plan Response API contract.
/// </summary>
public sealed record HuddlePlanResponse(
    string RoleExternalId,
    bool IsCustomized,
    string? RowVersion,
    IReadOnlyList<HuddlePlanItemResponse> Items);
