/*CurrentUserController
  ↓
GetCurrentUserQuery
  ↓
GetCurrentUserQueryHandler
  ↓
ICurrentUserService
  ↓
CurrentUserResponse*/



using AitoWorkflowAndHuddleGenerator.Api.Authorization;
using AitoWorkflowAndHuddleGenerator.Application.Features.Identity.Queries.GetCurrentUser;
using AitoWorkflowAndHuddleGenerator.Contracts.Identity;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AitoWorkflowAndHuddleGenerator.Api.Controllers;

[ApiController]
[Route("api/auth")]
[Authorize(Policy = Policies.AccessAsUser)]
/// <summary>
/// Provides information about the currently authenticated user.
/// </summary>
public sealed class CurrentUserController : ControllerBase
{
    private readonly ISender sender;

    /// <summary>
    /// Initializes a new instance of the <see cref="CurrentUserController"/> class.
    /// </summary>
    /// <param name="sender">The mediator used to dispatch identity queries.</param>
    public CurrentUserController(ISender sender)
    {
        this.sender = sender;
    }

    /// <summary>
    /// Gets the identity and application profile of the current user.
    /// </summary>
    /// <param name="cancellationToken">A token used to cancel the request.</param>
    /// <returns>The current authenticated user.</returns>
    [HttpGet("me")]
    [ProducesResponseType(
        typeof(CurrentUserResponse),
        StatusCodes.Status200OK)]
    [ProducesResponseType(
        StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(
        StatusCodes.Status403Forbidden)]
    /// <summary>
    /// Gets Me.
    /// </summary>
    public async Task<ActionResult<CurrentUserResponse>> GetMe(
        CancellationToken cancellationToken)
    {
        CurrentUserResponse response =
            await sender.Send(
                new GetCurrentUserQuery(),
                cancellationToken);

        return Ok(response);
    }
}

/*The controller only:

Receives the HTTP request
Dispatches the query
Returns the response

It contains no database logic or ownership logic.*/
