namespace AitoWorkflowAndHuddleGenerator.Contracts.Huddles.Coaching;

public sealed record CoachResponse(string ExternalId, string DisplayName, string? JobTitle, string? Biography, IReadOnlyList<string> Expertise, string TimeZone);
