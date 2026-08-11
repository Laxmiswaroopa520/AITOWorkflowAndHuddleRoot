namespace AitoWorkflowAndHuddleGenerator.Contracts.Huddles;

public sealed record HuddleActivityResponse(string ExternalId, string Name, string? Description, int? DurationMinutes, int DisplayOrder, string? Prompt, string? ExpectedOutput, string? HumanCheckpoint, string? RequiredContext, string? BestFitJob, IReadOnlyList<HuddleAgentResponse> Agents, IReadOnlyList<HuddleResourceResponse> Resources);
