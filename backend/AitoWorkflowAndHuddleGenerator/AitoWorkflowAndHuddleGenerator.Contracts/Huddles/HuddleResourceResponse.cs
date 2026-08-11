namespace AitoWorkflowAndHuddleGenerator.Contracts.Huddles;

public sealed record HuddleResourceResponse(string ExternalId, string Title, string? Description, string? Url, string? Type, string? LinkLabel, int DisplayOrder);
