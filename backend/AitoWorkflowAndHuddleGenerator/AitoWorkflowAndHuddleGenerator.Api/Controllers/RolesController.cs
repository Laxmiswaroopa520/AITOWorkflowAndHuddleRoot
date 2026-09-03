//Exposes the protected roles endpoint.
using AitoWorkflowAndHuddleGenerator.Api.Authorization;
using AitoWorkflowAndHuddleGenerator.Application.Features.Roles.Queries.GetRoles;
using AitoWorkflowAndHuddleGenerator.Contracts.Roles;
using AitoWorkflowAndHuddleGenerator.Domain.Enums;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AitoWorkflowAndHuddleGenerator.Api.Controllers;

[ApiController]
[Route("api/roles")]
[Authorize(Policy = Policies.AccessAsUser)]
/// <summary>
/// Provides authenticated access to the application role catalog.
/// </summary>
public sealed class RolesController : ControllerBase
{
    private readonly ISender sender;

    /// <summary>
    /// Initializes a new instance of the <see cref="RolesController"/> class.
    /// </summary>
    /// <param name="sender">The mediator used to dispatch role queries.</param>
    public RolesController(ISender sender)
    {
        this.sender = sender;
    }

    /// <summary>
    /// Gets application roles, optionally including inactive entries and scoped to one module.
    /// </summary>
    /// <param name="includeInactive">Whether inactive roles should be included.</param>
    /// <param name="module">
    /// Optional. Pass "Huddle" or "Workflow" to restrict the result to that module's roles.
    /// Omit to get every role regardless of which module owns it (the existing, unscoped
    /// behavior the Workflow Builder screens rely on).
    /// </param>
    /// <param name="cancellationToken">A token used to cancel the request.</param>
    /// <returns>The application role catalog.</returns>
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
            [FromQuery] RoleModule? module,
            CancellationToken cancellationToken)
    {
        IReadOnlyList<RoleResponse> response =
            await sender.Send(
                new GetRolesQuery(includeInactive, module),
                cancellationToken);

        return Ok(response);
    }
}