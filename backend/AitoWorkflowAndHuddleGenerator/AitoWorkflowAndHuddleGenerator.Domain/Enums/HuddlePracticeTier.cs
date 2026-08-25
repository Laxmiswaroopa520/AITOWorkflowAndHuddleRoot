namespace AitoWorkflowAndHuddleGenerator.Domain.Enums;

/// <summary>
/// Defines how prominently a Huddle activity is presented during Explore and Practice.
/// Sourced from the content workbook column PracticeTier.
/// </summary>
public enum HuddlePracticeTier
{
    /// <summary>Priority practice for the session; shown expanded by default.</summary>
    Featured = 1,

    /// <summary>Deeper practice offered after the featured activities.</summary>
    Extended = 2
}
