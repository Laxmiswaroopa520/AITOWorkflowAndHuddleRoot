//Defines AI-tool metadata, color, and icon information.
namespace AitoWorkflowAndHuddleGenerator.Contracts.AiTools;

/// <summary>
/// Represents the Ai Tool Response API contract.
/// </summary>
public sealed record AiToolResponse(
    int Id,
    string ExternalId,
    string Name,
    string? Description,
    string? Color,
    string? IconKey,
    int SortOrder);

/*The Color and IconKey values are important for preserving the exact tool badges, colors, and icons from the old UI.*/