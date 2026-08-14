using AitoWorkflowAndHuddleGenerator.Api.Authorization;
using AitoWorkflowAndHuddleGenerator.Application.Features.AiTools.Queries.GetAiTools;
using AitoWorkflowAndHuddleGenerator.Contracts.AiTools;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AitoWorkflowAndHuddleGenerator.Api.Controllers;

[ApiController]
[Route("api/ai-tools")]
[Authorize(Policy = Policies.AccessAsUser)]
/// <summary>
/// This AiToolsController provides an API for the frontend to retrieve the AI tools catalog from the backend/database.
/// </summary>
public sealed class AiToolsController : ControllerBase
{
    private readonly ISender sender;

    /// <summary>
    /// Initializes a new instance of the <see cref="AiToolsController"/> class.
    /// </summary>
    /// <param name="sender">The mediator used to dispatch AI tool queries.</param>
    public AiToolsController(ISender sender)
    {
        this.sender = sender;
    }

    /// <summary>
    /// Gets AI tools, optionally including inactive catalog entries.
    /// </summary>
    /// <param name="includeInactive">Whether inactive AI tools should be included.</param>
    /// <param name="cancellationToken">A token used to cancel the request.</param>
    /// <returns>The AI tool catalog.</returns>
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
            await sender.Send(
                new GetAiToolsQuery(includeInactive),
                cancellationToken);

        return Ok(response);
    }
}
