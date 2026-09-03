namespace AitoWorkflowAndHuddleGenerator.Domain.Enums;

/// <summary>
/// Defines which part of the application owns a role. The Workflow Builder module and the
/// Huddle module both seed rows into the shared <c>dbo.Roles</c> table, and several role names
/// exist as a distinct row for each module (Account Executive, Account Technology Strategist,
/// Cloud Solution Architect, Commercial Executive, and Solution Sales Professional all have both
/// a Workflow-owned row and a Huddle-owned row). A caller that only wants one module's roles
/// should filter on this instead of assuming every row returned by the roles endpoint belongs to
/// it -- that assumption is what caused the Huddle audience picker to show every shared role name
/// twice.
/// </summary>
public enum RoleModule
{
    /// <summary>A role seeded by the Workflow Builder import (ExternalId such as "ae-ent").</summary>
    Workflow = 1,

    /// <summary>A role seeded by the Huddle import (ExternalId such as "ROLE-AE").</summary>
    Huddle = 2
}
