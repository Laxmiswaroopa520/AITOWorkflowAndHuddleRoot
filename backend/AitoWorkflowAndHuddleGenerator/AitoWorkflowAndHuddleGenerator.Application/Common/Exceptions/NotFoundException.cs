namespace AitoWorkflowAndHuddleGenerator
    .Application
    .Common
    .Exceptions;

/// <summary>
/// Represents a Not Found Exception error.
/// </summary>
public sealed class NotFoundException
    : Exception
{
    public NotFoundException(
        string message)
        : base(message)
    {
    }
}