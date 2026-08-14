namespace AitoWorkflowAndHuddleGenerator.Application.Common.Exceptions;

/// <summary>
/// Represents a External Service Unavailable Exception error.
/// </summary>
public sealed class ExternalServiceUnavailableException : Exception
{
    public ExternalServiceUnavailableException(string message)
        : base(message)
    {
    }

    public ExternalServiceUnavailableException(
        string message,
        Exception innerException)
        : base(message, innerException)
    {
    }
}
