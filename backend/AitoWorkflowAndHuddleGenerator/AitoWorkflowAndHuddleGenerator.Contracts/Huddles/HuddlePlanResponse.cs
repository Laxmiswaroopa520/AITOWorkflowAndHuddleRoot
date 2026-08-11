namespace AitoWorkflowAndHuddleGenerator.Contracts.Huddles;

public sealed record HuddlePlanResponse(
    string RoleExternalId,
    bool IsCustomized,
    string? RowVersion,
    IReadOnlyList<HuddlePlanItemResponse> Items);
