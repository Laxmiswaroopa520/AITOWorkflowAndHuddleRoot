namespace AitoWorkflowAndHuddleGenerator.Domain.Constants.Messages;

/// <summary>
/// Provides Api Problem Messages operations and constants.
/// </summary>
public static class ApiProblemMessages
{
    public const string ValidationErrorsOccurred = "One or more validation errors occurred.";
    public const string UnexpectedErrorOccurred = "An unexpected error occurred.";
    public const string UnexpectedErrorDetail = "The request could not be completed. Use the correlation ID when contacting support.";
    public const string ValidationFailed = "Validation failed";
    public const string ResourceNotFound = "Resource not found";
    public const string Conflict = "Conflict";
    public const string Forbidden = "Forbidden";
    public const string Unauthorized = "Unauthorized";
    public const string ConcurrencyConflict = "Concurrency conflict";
    public const string ExternalServiceUnavailable = "External service unavailable";
    public const string UnexpectedError = "An unexpected error occurred";
    public const string UnhandledExceptionLog = "An unhandled exception occurred. Correlation ID: {CorrelationId}";
    public const string RequestFailureLog = "A request failed with status {StatusCode}. Correlation ID: {CorrelationId}";
}
