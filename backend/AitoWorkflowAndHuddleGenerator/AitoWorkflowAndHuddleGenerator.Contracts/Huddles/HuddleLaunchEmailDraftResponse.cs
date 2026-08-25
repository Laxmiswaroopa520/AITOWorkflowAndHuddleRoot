namespace AitoWorkflowAndHuddleGenerator.Contracts.Huddles;

/// <summary>
/// Represents the Huddle Launch Email Draft Response API contract.
/// </summary>
/// <param name="MessageId">Microsoft Graph message identifier for the created draft.</param>
/// <param name="WebLink">Outlook on the web URL that opens the draft for editing.</param>
public sealed record HuddleLaunchEmailDraftResponse(string MessageId, string WebLink);
