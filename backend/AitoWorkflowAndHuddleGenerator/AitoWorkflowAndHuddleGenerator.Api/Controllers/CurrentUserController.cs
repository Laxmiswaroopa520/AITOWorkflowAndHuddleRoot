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
using AitoWorkflowAndHuddleGenerator
    .Application
    .Features
    .Identity
    .Queries
    .GetCurrentUser;
using AitoWorkflowAndHuddleGenerator.Contracts.Identity;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AitoWorkflowAndHuddleGenerator.Api.Controllers;

[ApiController]
[Route("api/auth")]
[Authorize(Policy = Policies.AccessAsUser)]
public sealed class CurrentUserController : ControllerBase
{
    private readonly ISender _sender;

    public CurrentUserController(ISender sender)
    {
        _sender = sender;
    }

    [HttpGet("me")]
    [ProducesResponseType(
        typeof(CurrentUserResponse),
        StatusCodes.Status200OK)]
    [ProducesResponseType(
        StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(
        StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<CurrentUserResponse>> GetMe(
        CancellationToken cancellationToken)
    {
        CurrentUserResponse response =
            await _sender.Send(
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