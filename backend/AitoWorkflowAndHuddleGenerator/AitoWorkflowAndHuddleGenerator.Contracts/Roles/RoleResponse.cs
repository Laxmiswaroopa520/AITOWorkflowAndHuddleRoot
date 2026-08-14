namespace AitoWorkflowAndHuddleGenerator.Contracts.Roles;
//Defines the role data returned to React.
/// <summary>
/// Represents the Role Response API contract.
/// </summary>
public sealed record RoleResponse(
    int Id,
    string ExternalId,
    string Name,
    string Abbreviation,
    string? Segment,
    string? Description,
    int SortOrder);

/*ExternalId remains the stable frontend identifier, such as:

ae
ats
ssp
se
ce
csam
csa
manager

The integer Id is the database identity key.*/