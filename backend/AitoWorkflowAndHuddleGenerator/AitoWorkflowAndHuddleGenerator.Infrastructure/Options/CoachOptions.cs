namespace AitoWorkflowAndHuddleGenerator.Infrastructure.Options;

/// <summary>
/// Defines configuration options for Coach.
/// </summary>
public sealed class CoachOptions
{
    public string ExternalId { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public string? JobTitle { get; set; }
    public string? Biography { get; set; }
    public string[] Expertise { get; set; } = [];
    public string TimeZone { get; set; } = "UTC";
    public string[] SupportedHuddleExternalIds { get; set; } = [];
    public string[] WorkingDays { get; set; } = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    public TimeOnly WorkDayStart { get; set; } = new(9, 0);
    public TimeOnly WorkDayEnd { get; set; } = new(17, 0);
    public int MinimumNoticeHours { get; set; } = 1;
    public int MaximumAdvanceDays { get; set; } = 30;
    public bool Active { get; set; } = true;
}
