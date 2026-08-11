namespace AitoWorkflowAndHuddleGenerator.Contracts.Huddles;

public sealed record SaveHuddlePlanRequest(
    string RoleExternalId,
    string? RowVersion,
    IReadOnlyList<SaveHuddlePlanItemRequest> Items);
