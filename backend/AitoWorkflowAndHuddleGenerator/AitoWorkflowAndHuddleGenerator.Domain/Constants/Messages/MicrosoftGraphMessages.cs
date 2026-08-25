namespace AitoWorkflowAndHuddleGenerator.Domain.Constants.Messages;

/// <summary>
/// Provides Microsoft Graph Messages operations and constants.
/// </summary>
public static class MicrosoftGraphMessages
{
    public const string CoachAuthorizationNotConfigured = "Microsoft Graph authorization is not configured for Coach scheduling.";
    public const string CalendarAuthorizationUnavailable = "Microsoft Graph calendar authorization is unavailable. Verify the backend credential and delegated consent.";
    public const string EventIdMissing = "Microsoft Graph did not return an event ID.";
    public const string MailAuthorizationUnavailable = "Microsoft Graph mail authorization is unavailable. Verify the delegated Mail.ReadWrite consent.";
    public const string MailBannerMissing = "The Frontier Accelerator email banner is missing from the deployed assembly.";

    /// <summary>
    /// Executes the Calendar Request Failed operation.
    /// </summary>

    public static string CalendarRequestFailed(int statusCode) =>
        $"Microsoft Graph calendar request failed with status {statusCode}.";

    /// <summary>
    /// Executes the Mail Request Failed operation.
    /// </summary>

    public static string MailRequestFailed(int statusCode) =>
        $"Microsoft Graph mail request failed with status {statusCode}.";

    /// <summary>
    /// Executes the Response Property Missing operation.
    /// </summary>

    public static string ResponsePropertyMissing(string propertyName) =>
        $"Microsoft Graph response omitted '{propertyName}'.";
}
