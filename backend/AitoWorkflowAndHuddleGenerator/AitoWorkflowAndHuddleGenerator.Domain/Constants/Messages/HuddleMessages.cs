namespace AitoWorkflowAndHuddleGenerator.Domain.Constants.Messages;

/// <summary>
/// Provides Huddle Messages operations and constants.
/// </summary>
public static class HuddleMessages
{
    public const string NotFound = "The Huddle was not found.";
    public const string SavedPlanInvalid = "The saved Huddle plan is incomplete or invalid. Reset it to the recommended path.";
    public const string SelectedHuddlesUnavailable = "One or more selected Huddles are unavailable or unpublished.";
    public const string PlanNoLongerExists = "The Huddle plan no longer exists. Refresh and try again.";
    public const string PlanChanged = "The Huddle plan changed. Refresh and try again.";
    public const string PlanChangedByAnotherRequest = "This Huddle plan was changed by another request. Refresh and try again.";
    public const string PlanAlreadyExists = "A Huddle plan already exists for this user and role. Refresh and try again.";
    public const string PlanWeeksInvalid = "The plan must contain exactly one item for each week from 2 through 8.";
    public const string PlanHuddlesMustBeUnique = "The plan must contain seven unique Huddles.";
    public const string SessionNotFound = "The Huddle session was not found.";
    public const string SessionAlreadyComplete = "This Huddle session is already complete.";
    public const string ActivityDoesNotBelong = "The activity does not belong to this Huddle.";
    public const string PhaseDoesNotBelong = "The selected phase does not belong to this Huddle.";
    public const string SessionNoLongerExists = "The Huddle session no longer exists. Refresh and try again.";
    public const string SessionChanged = "The Huddle session changed. Refresh and try again.";
    public const string SessionChangedByAnotherRequest = "This Huddle session was changed by another request. Refresh and try again.";
    public const string SessionAlreadyExists = "A Huddle session already exists for this user and topic. Refresh and try again.";
    public const string ActivitiesMustBeComplete = "All current Huddle activities must be complete before completing the session.";
    public const string InvalidVote = "Vote value must be -1 or 1.";
    public const string TooManyDownvoteReasons = "A maximum of 10 downvote reasons is allowed.";
    public const string InvalidCatalogSort = "Sort must be default, name, priority, most-upvoted, or role-relevance.";
    public const string LaunchPlanNotFound = "The Huddle launch plan was not found.";
    public const string LaunchPlanChanged = "The Huddle launch plan changed. Refresh and try again.";
    public const string LaunchPlanChangedByAnotherRequest = "This Huddle launch plan was changed by another request. Refresh and try again.";
    public const string LaunchPlanAlreadyExists = "A Huddle launch plan already exists for this user. Refresh and try again.";

    /// <summary>
    /// Executes the Published Not Found operation.
    /// </summary>

    public static string PublishedNotFound(string externalId) => $"Published Huddle '{externalId}' was not found.";
    /// <summary>
    /// Executes the Active Role Not Found operation.
    /// </summary>
    public static string ActiveRoleNotFound(string externalId) => $"Active role '{externalId}' was not found.";
    /// <summary>
    /// Executes the Recommended Path Incomplete operation.
    /// </summary>
    public static string RecommendedPathIncomplete(string externalId) =>
        $"Role '{externalId}' does not have exactly seven unique published recommended Huddles.";
}
