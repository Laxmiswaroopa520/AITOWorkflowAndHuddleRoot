namespace AitoWorkflowAndHuddleGenerator.Contracts.Huddles;

/// <summary>
/// Represents the Huddle Activity Response API contract.
/// </summary>
public sealed record HuddleActivityResponse(string ExternalId, string Name, string? Description, int? DurationMinutes, int DisplayOrder, string? Prompt, string? ExpectedOutput, string? HumanCheckpoint, string? RequiredContext, string? BestFitJob, IReadOnlyList<HuddleAgentResponse> Agents, IReadOnlyList<HuddleResourceResponse> Resources);
