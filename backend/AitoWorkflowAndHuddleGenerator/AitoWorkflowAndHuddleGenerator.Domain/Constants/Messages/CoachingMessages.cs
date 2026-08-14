namespace AitoWorkflowAndHuddleGenerator.Domain.Constants.Messages;

/// <summary>
/// Provides Coaching Messages operations and constants.
/// </summary>
public static class CoachingMessages
{
    public const string TimeNoLongerAvailable = "The selected time is no longer available. Refresh availability and choose another time.";
    public const string DirectoryNotConfigured = "The approved Coach directory has not been configured.";
    public const string DirectoryEntryIncomplete = "The Coach directory contains an incomplete entry.";
    public const string InvalidDuration = "Duration must be 30 or 60 minutes.";
    public const string InvalidBookingDuration = "Booking duration must be 30 or 60 minutes.";
    public const string InvalidAvailabilityWindow = "The availability window is invalid.";

    /// <summary>
    /// Executes the Coach Not Found operation.
    /// </summary>

    public static string CoachNotFound(string externalId) => $"Coach '{externalId}' was not found.";
    /// <summary>
    /// Executes the Invalid Time Zone operation.
    /// </summary>
    public static string InvalidTimeZone(string id) => $"Coach time zone '{id}' is not valid on this server.";
}
