namespace AitoWorkflowAndHuddleGenerator.Contracts.Huddles;

/// <summary>
/// Represents the Huddle Session Response API contract.
/// </summary>
public sealed record HuddleSessionResponse(
    string HuddleExternalId,
    string? CurrentPhaseExternalId,
    string? FacilitatorNotes,
    DateTimeOffset StartedAtUtc,
    DateTimeOffset LastSavedAtUtc,
    DateTimeOffset? CompletedAtUtc,
    string SessionStatus,
    string RowVersion,
    IReadOnlyList<HuddleSessionActivityProgressResponse> Activities,
    IReadOnlyList<string> RemovedActivityExternalIds,
    int ValidActivityCount,
    int CompletedActivityCount,
    bool CanContinue);
