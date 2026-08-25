namespace AitoWorkflowAndHuddleGenerator.Contracts.Huddles;

/// <summary>
/// Represents the Incomplete Huddle Session Response API contract.
/// </summary>
public sealed record IncompleteHuddleSessionResponse(
    string HuddleExternalId,
    string HuddleName,
    string? HuddleDescription,
    string HuddleType,
    HuddleSessionResponse Session);
