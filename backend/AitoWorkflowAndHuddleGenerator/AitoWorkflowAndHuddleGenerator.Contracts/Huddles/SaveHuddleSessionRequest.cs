namespace AitoWorkflowAndHuddleGenerator.Contracts.Huddles;

/// <summary>
/// Represents the Save Huddle Session Request API contract.
/// </summary>
public sealed record SaveHuddleSessionRequest(
    string? CurrentPhaseExternalId,
    string? FacilitatorNotes,
    string? RowVersion);
