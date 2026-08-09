using AitoWorkflowAndHuddleGenerator
    .Contracts
    .Workflows;
using AitoWorkflowAndHuddleGenerator
    .Domain
    .Entities;

namespace AitoWorkflowAndHuddleGenerator
    .Application
    .Features
    .Workflows
    .Common;

internal static class WorkflowMappings
{
    public static WorkflowSummaryResponse
        ToSummary(
            UserWorkflow workflow)
    {
        return new WorkflowSummaryResponse(
            Id: workflow.Id,
            Name: workflow.Name,
            Description:
                workflow.Description,
            RoleExternalId:
                workflow.Role.ExternalId,
            RoleName:
                workflow.Role.Name,
            RoleAbbreviation:
                workflow.Role.Abbreviation,
            ActivityCount:
                workflow
                    .UserWorkflowActivities
                    .Count,
            TotalDurationMinutes:
                workflow
                    .TotalDurationMinutes,
            IsFavorite:
                workflow.IsFavorite,
            CreatedAtUtc:
                workflow.CreatedAtUtc,
            UpdatedAtUtc:
                workflow.UpdatedAtUtc,
            RowVersion:
                Convert.ToBase64String(
                    workflow.RowVersion));
    }

    public static WorkflowResponse
        ToResponse(
            UserWorkflow workflow)
    {
        WorkflowActivityResponse[] activities =
            workflow
                .UserWorkflowActivities
                .OrderBy(
                    mapping =>
                        mapping.SortOrder)
                .Select(mapping =>
                    new WorkflowActivityResponse(
                        Id:
                            mapping.Activity.Id,
                        ExternalId:
                            mapping
                                .Activity
                                .ExternalId,
                        Title:
                            mapping
                                .Activity
                                .Title,
                        Description:
                            mapping
                                .Activity
                                .Description,
                        WorkflowBucketExternalId:
                            mapping
                                .Activity
                                .WorkflowBucket
                                .ExternalId,
                        WorkflowBucketName:
                            mapping
                                .Activity
                                .WorkflowBucket
                                .Name,
                        Category:
                            mapping
                                .Activity
                                .Category
                                .ToString(),
                        Frequency:
                            mapping
                                .Activity
                                .Frequency
                                .ToString(),
                        Priority:
                            mapping
                                .Activity
                                .Priority
                                .ToString(),
                        DurationMinutes:
                            mapping
                                .Activity
                                .DurationMinutes,
                        SortOrder:
                            mapping.SortOrder))
                .ToArray();

        return new WorkflowResponse(
            Id: workflow.Id,
            Name: workflow.Name,
            Description:
                workflow.Description,
            OwnerObjectId:
                workflow.OwnerObjectId,
            OwnerEmail:
                workflow.OwnerEmail,
            OwnerDisplayName:
                workflow.OwnerDisplayName,
            RoleExternalId:
                workflow.Role.ExternalId,
            RoleName:
                workflow.Role.Name,
            RoleAbbreviation:
                workflow.Role.Abbreviation,
            TotalDurationMinutes:
                workflow
                    .TotalDurationMinutes,
            IsFavorite:
                workflow.IsFavorite,
            CreatedAtUtc:
                workflow.CreatedAtUtc,
            UpdatedAtUtc:
                workflow.UpdatedAtUtc,
            RowVersion:
                Convert.ToBase64String(
                    workflow.RowVersion),
            Activities: activities);
    }
}