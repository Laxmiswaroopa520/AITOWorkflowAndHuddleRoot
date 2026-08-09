using AitoWorkflowAndHuddleGenerator
    .Api
    .Authorization;
using AitoWorkflowAndHuddleGenerator
    .Application
    .Features
    .AiTools
    .Queries
    .GetAiTools;
using AitoWorkflowAndHuddleGenerator.Contracts.AiTools;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AitoWorkflowAndHuddleGenerator
    .Api
    .Controllers;

[ApiController]
[Route("api/ai-tools")]
[Authorize(Policy = Policies.AccessAsUser)]
public sealed class AiToolsController : ControllerBase
{
    private readonly ISender _sender;

    public AiToolsController(ISender sender)
    {
        _sender = sender;
    }

    [HttpGet]
    [ProducesResponseType(
        typeof(IReadOnlyList<AiToolResponse>),
        StatusCodes.Status200OK)]
    [ProducesResponseType(
        StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(
        StatusCodes.Status403Forbidden)]
    public async Task<
        ActionResult<IReadOnlyList<AiToolResponse>>>
        GetAiTools(
            [FromQuery] bool includeInactive,
            CancellationToken cancellationToken)
    {
        IReadOnlyList<AiToolResponse> response =
            await _sender.Send(
                new GetAiToolsQuery(includeInactive),
                cancellationToken);

        return Ok(response);
    }
}