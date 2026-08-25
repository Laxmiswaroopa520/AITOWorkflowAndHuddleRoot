/*The activity mapping is used by three handlers. Keep it in one reusable projection so every endpoint returns the same structure.*/
//Centralizes EF-to-DTO activity mapping.
using System.Linq.Expressions;
using AitoWorkflowAndHuddleGenerator.Contracts.Activities;
using AitoWorkflowAndHuddleGenerator.Domain.Entities;

namespace AitoWorkflowAndHuddleGenerator
    .Application
    .Features
    .Activities
    .Common;

/// <summary>
/// Provides Activity Projection operations and constants.
/// </summary>
internal static class ActivityProjection
{
    public static readonly Expression<
        Func<Activity, ActivityResponse>>
        ToResponse =
            activity => new ActivityResponse(
                activity.Id,
                activity.ExternalId,
                activity.Title,
                activity.Description,
                activity.Role.ExternalId,
                activity.Role.Name,
                activity.Role.Abbreviation,
                activity.WorkflowBucket.ExternalId,
                activity.WorkflowBucket.Name,
                activity.Category.ToString(),
                activity.Frequency.ToString(),
                activity.Priority.ToString(),
                activity.ToolCoverageLevel.ToString(),
                activity.TriggerContext.ToString(),
                activity.McemStage.ToString(),
                activity.DurationMinutes,
                activity.BusinessOutcome,
                activity.BeginnerPrompt,
                activity.AdvancedPrompt,
                activity.SuggestedOutputs,
                activity.SortOrder,
                activity.ActivityAiTools
                    .OrderBy(mapping => mapping.SortOrder)
                    .ThenBy(mapping =>
                        mapping.AiTool.SortOrder)
                    .Select(mapping =>
                        new ActivityAiToolResponse(
                            mapping.AiTool.Id,
                            mapping.AiTool.ExternalId,
                            mapping.AiTool.Name,
                            mapping.AiTool.Description,
                            mapping.AiTool.Color,
                            mapping.AiTool.IconKey,
                            mapping.SortOrder,
                            mapping.IsPrimary))
                    .ToList());
}