//Exposes the protected roles endpoint.
using AitoWorkflowAndHuddleGenerator
    .Api
    .Authorization;
using AitoWorkflowAndHuddleGenerator
    .Application
    .Features
    .Roles
    .Queries
    .GetRoles;
using AitoWorkflowAndHuddleGenerator.Contracts.Roles;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AitoWorkflowAndHuddleGenerator
    .Api
    .Controllers;

[ApiController]
[Route("api/roles")]
[Authorize(Policy = Policies.AccessAsUser)]
public sealed class RolesController : ControllerBase
{
    private readonly ISender _sender;

    public RolesController(ISender sender)
    {
        _sender = sender;
    }

    [HttpGet]
    [ProducesResponseType(
        typeof(IReadOnlyList<RoleResponse>),
        StatusCodes.Status200OK)]
    [ProducesResponseType(
        StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(
        StatusCodes.Status403Forbidden)]
    public async Task<
        ActionResult<IReadOnlyList<RoleResponse>>> GetRoles(
            [FromQuery] bool includeInactive,
            CancellationToken cancellationToken)
    {
        IReadOnlyList<RoleResponse> response =
            await _sender.Send(
                new GetRolesQuery(includeInactive),
                cancellationToken);

        return Ok(response);
    }
}