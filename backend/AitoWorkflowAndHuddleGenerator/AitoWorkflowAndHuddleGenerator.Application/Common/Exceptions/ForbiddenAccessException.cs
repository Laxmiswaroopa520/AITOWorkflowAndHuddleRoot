namespace AitoWorkflowAndHuddleGenerator
    .Application
    .Common
    .Exceptions;

/// <summary>
/// Represents a Forbidden Access Exception error.
/// </summary>
public sealed class ForbiddenAccessException
    : Exception
{
    public ForbiddenAccessException(
        string message)
        : base(message)
    {
    }
}