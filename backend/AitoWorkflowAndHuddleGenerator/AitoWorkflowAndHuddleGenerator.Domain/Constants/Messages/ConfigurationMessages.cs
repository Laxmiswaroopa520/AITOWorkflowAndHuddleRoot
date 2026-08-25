namespace AitoWorkflowAndHuddleGenerator.Domain.Constants.Messages;

/// <summary>
/// Provides Configuration Messages operations and constants.
/// </summary>
public static class ConfigurationMessages
{
    public const string CorsOriginsRequired = "At least one frontend CORS origin must be configured.";
    public const string DefaultConnectionRequired = "Connection string 'DefaultConnection' was not configured.";

    /// <summary>
    /// Executes the App Settings Not Found operation.
    /// </summary>

    public static string AppSettingsNotFound(string path) => $"appsettings.json was not found at: {path}";
    /// <summary>
    /// Executes the Default Connection Required For Environment operation.
    /// </summary>
    public static string DefaultConnectionRequiredForEnvironment(string environment) =>
        $"Connection string 'DefaultConnection' was not configured for environment '{environment}'.";
}
