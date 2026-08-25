namespace AitoWorkflowAndHuddleGenerator.Domain.Constants.Messages;

/// <summary>
/// Provides Authentication Messages operations and constants.
/// </summary>
public static class AuthenticationMessages
{
    public const string RequestNotAuthenticated = "The current request is not authenticated.";
    public const string MissingObjectIdClaim = "The authenticated token does not contain an oid claim.";
    public const string MissingEmailClaim = "The authenticated token does not contain an email claim.";
}
