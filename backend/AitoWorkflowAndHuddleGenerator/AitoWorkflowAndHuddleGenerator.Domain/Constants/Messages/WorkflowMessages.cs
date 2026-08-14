namespace AitoWorkflowAndHuddleGenerator.Domain.Constants.Messages;

/// <summary>
/// Provides Workflow Messages operations and constants.
/// </summary>
public static class WorkflowMessages
{
    public const string NotFound = "The workflow was not found.";
    public const string SelectedRoleNotFound = "The selected role was not found.";
    public const string SelectedActivitiesNotFound = "One or more selected activities no longer exist.";
    public const string ActivitiesDoNotBelongToRole = "One or more activities do not belong to the selected role.";
    public const string ChangedByAnotherRequest = "This workflow was changed by another request. Refresh and try again.";
    public const string ActivityRequired = "At least one activity must be selected.";
    /// <summary>
    /// Executes the Duplicate Name operation.
    /// </summary>
    public static string DuplicateName(string name) =>
        $"A workflow named '{name}' is already saved. Try a different name.";
}
