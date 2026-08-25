namespace AitoWorkflowAndHuddleGenerator.Contracts.Huddles.Coaching;

/// <summary>
/// Represents the Coach Response API contract.
/// </summary>
public sealed record CoachResponse(string ExternalId, string DisplayName, string? JobTitle, string? Biography, IReadOnlyList<string> Expertise, string TimeZone);
