namespace AitoWorkflowAndHuddleGenerator.Contracts.Huddles;

public sealed record SaveHuddleSessionRequest(
    string? CurrentPhaseExternalId,
    string? FacilitatorNotes,
    string? RowVersion);
