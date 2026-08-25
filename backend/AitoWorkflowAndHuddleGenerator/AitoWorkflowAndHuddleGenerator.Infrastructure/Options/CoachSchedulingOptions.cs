namespace AitoWorkflowAndHuddleGenerator.Infrastructure.Options;

/// <summary>
/// Defines configuration options for Coach Scheduling.
/// </summary>
public sealed class CoachSchedulingOptions
{
    public const string SectionName = "CoachScheduling";
    public string[] GraphScopes { get; set; } = ["Calendars.ReadWrite"];
    public List<CoachOptions> Coaches { get; set; } = [];
}
