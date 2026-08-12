namespace AitoWorkflowAndHuddleGenerator.Contracts.Huddles;

public sealed record IncompleteHuddleSessionResponse(
    string HuddleExternalId,
    string HuddleName,
    string? HuddleDescription,
    string HuddleType,
    HuddleSessionResponse Session);
