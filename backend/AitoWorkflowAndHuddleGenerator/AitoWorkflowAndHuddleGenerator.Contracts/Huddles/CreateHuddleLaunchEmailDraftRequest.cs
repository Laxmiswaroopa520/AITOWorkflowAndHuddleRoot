namespace AitoWorkflowAndHuddleGenerator.Contracts.Huddles;

/// <summary>
/// Represents the Create Huddle Launch Email Draft Request API contract.
/// </summary>
/// <param name="Subject">Personalized subject line for the launch communication.</param>
/// <param name="BodyText">
/// Plain-text body already personalized by the caller. The service wraps it in the branded
/// HTML shell, so callers never build markup.
/// </param>
public sealed record CreateHuddleLaunchEmailDraftRequest(string Subject, string BodyText);
