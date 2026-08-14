namespace AitoWorkflowAndHuddleGenerator
    .Application
    .Common
    .Exceptions;

/// <summary>
/// Represents a Conflict Exception error.
/// </summary>
public sealed class ConflictException
    : Exception
{
    public ConflictException(
        string message)
        : base(message)
    {
    }
}