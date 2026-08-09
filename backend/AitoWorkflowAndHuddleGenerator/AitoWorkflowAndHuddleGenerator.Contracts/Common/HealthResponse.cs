/*In C#, a sealed class is a class that cannot be inherited by any other class. It serves as the absolute bottom-most layer of an inheritance hierarchy, preventing developers from deriving new subclasses from it*/

namespace AitoWorkflowAndHuddleGenerator.Contracts.Common;

public sealed record HealthResponse(
    string Status,
    string Application,
    string Environment,
    DateTimeOffset TimestampUtc,
    DatabaseHealthResponse Database);

public sealed record DatabaseHealthResponse(
    string Status,
    string? Message);