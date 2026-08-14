namespace AitoWorkflowAndHuddleGenerator.Domain.Enums;

/// <summary>
/// Defines the supported Trigger Context values.
/// </summary>
public enum TriggerContext
{
    Unspecified = 0,
    None = 1,
    AsNeeded = 2,
    PreMeeting = 3,
    PostMeeting = 4,
    Recurring = 5,
    RenewalCycle = 6
}

/*
public enum TriggerContext
{
    Unspecified = 0,
    Planned = 1,
    EventDriven = 2,
    CustomerDriven = 3,
    ManagerDriven = 4,
    OpportunityDriven = 5
}
*/