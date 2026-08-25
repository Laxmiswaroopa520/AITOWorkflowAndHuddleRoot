namespace AitoWorkflowAndHuddleGenerator.Domain.Enums;

/// <summary>
/// Defines the supported Huddle Agent Usage Type values. Surfaced and Alternate were
/// added for the V4 content workbook, which uses them on Activity_Agents rows.
/// Persisted as a string, so the numeric values are not stored.
/// </summary>
public enum HuddleAgentUsageType
{
    /// <summary>The agent the activity is primarily run in.</summary>
    Primary = 1,

    /// <summary>A supporting agent used alongside the primary one.</summary>
    Secondary = 2,

    /// <summary>Named so participants know the agent exists, without being asked to run it.</summary>
    Surfaced = 3,

    /// <summary>An acceptable substitute when the primary agent is unavailable.</summary>
    Alternate = 4
}
