namespace AitoWorkflowAndHuddleGenerator.Contracts.Huddles;

/// <summary>
/// Represents the Huddle Activity Response API contract.
/// </summary>
public sealed record HuddleActivityResponse(
    string ExternalId,
    string Name,
    string? Description,
    int? DurationMinutes,
    int DisplayOrder,
    string? Prompt,
    string? ExpectedOutput,
    string? HumanCheckpoint,
    string? RequiredContext,
    string? BestFitJob,
    /// <summary>Featured or Extended. Drives which section of Explore and Practice the activity appears in.</summary>
    string PracticeTier,
    /// <summary>Prompt, Activity or Both.</summary>
    string ExecutionMethod,
    /// <summary>Numbered practice steps, one per entry.</summary>
    IReadOnlyList<string> ActivitySteps,
    string? WhyThisMatters,
    /// <summary>Entry point for the tool. Null when nothing is published, so the launch button is suppressed.</summary>
    string? LaunchUrl,
    string? LaunchLabel,
    /// <summary>Activity whose output this one consumes, or null.</summary>
    string? PrerequisiteActivityExternalId,
    string? PrerequisiteActivityName,
    IReadOnlyList<HuddleAgentResponse> Agents,
    IReadOnlyList<HuddleResourceResponse> Resources);
