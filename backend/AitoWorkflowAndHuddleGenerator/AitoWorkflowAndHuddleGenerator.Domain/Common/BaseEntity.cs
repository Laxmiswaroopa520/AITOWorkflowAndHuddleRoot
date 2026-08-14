//Provides the common primary key property used by all entities.
namespace AitoWorkflowAndHuddleGenerator.Domain.Common;

/// <summary>
/// Represents the Base Entity model.
/// </summary>
public abstract class BaseEntity<TKey>
    where TKey : notnull
{
    public TKey Id { get; set; } = default!;
}