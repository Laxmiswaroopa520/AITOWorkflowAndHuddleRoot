using AitoWorkflowAndHuddleGenerator.Api.Authorization;
using AitoWorkflowAndHuddleGenerator.Application.Features.Huddles.Catalog.Queries.GetHuddleById;
using AitoWorkflowAndHuddleGenerator.Application.Features.Huddles.Catalog.Queries.GetHuddleCatalog;
using AitoWorkflowAndHuddleGenerator.Application.Features.Huddles.Catalog.Queries.GetRecommendedPath;
using AitoWorkflowAndHuddleGenerator.Application.Features.Huddles.Votes.Commands.RemoveHuddleVote;
using AitoWorkflowAndHuddleGenerator.Application.Features.Huddles.Votes.Commands.SetHuddleVote;
using AitoWorkflowAndHuddleGenerator.Application.Features.Huddles.Votes.Queries.GetHuddleVotes;
using AitoWorkflowAndHuddleGenerator.Contracts.Huddles;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AitoWorkflowAndHuddleGenerator.Api.Controllers;

[ApiController]
[Route("api/huddles")]
[Authorize(Policy = Policies.AccessAsUser)]
public sealed class HuddlesController : ControllerBase
{
    private readonly ISender _sender;
    public HuddlesController(ISender sender) => _sender = sender;

    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<HuddleCatalogItemResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<IReadOnlyList<HuddleCatalogItemResponse>>> GetCatalog(
        [FromQuery] HuddleCatalogFilterRequest filters, CancellationToken cancellationToken)
    {
        IReadOnlyList<HuddleCatalogItemResponse> response = await _sender.Send(
            new GetHuddleCatalogQuery(filters.RoleExternalId, filters.FocusAreaExternalId,
                filters.AgentExternalId, filters.Type, filters.Search, filters.Sort), cancellationToken);
        return Ok(response);
    }

    [HttpGet("recommended-path")]
    [ProducesResponseType(typeof(RecommendedHuddlePathResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<RecommendedHuddlePathResponse>> GetRecommendedPath(
        [FromQuery] string roleExternalId, CancellationToken cancellationToken)
    {
        RecommendedHuddlePathResponse response = await _sender.Send(
            new GetRecommendedPathQuery(roleExternalId), cancellationToken);
        return Ok(response);
    }

    [HttpGet("votes")]
    [ProducesResponseType(typeof(IReadOnlyList<HuddleVoteResponse>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<HuddleVoteResponse>>> GetVotes(
        CancellationToken cancellationToken)
    {
        IReadOnlyList<HuddleVoteResponse> response = await _sender.Send(
            new GetHuddleVotesQuery(), cancellationToken);
        return Ok(response);
    }

    [HttpPut("{externalId}/vote")]
    [ProducesResponseType(typeof(HuddleVoteResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<HuddleVoteResponse>> SetVote(
        string externalId,
        [FromBody] SetHuddleVoteRequest request,
        CancellationToken cancellationToken)
    {
        HuddleVoteResponse response = await _sender.Send(new SetHuddleVoteCommand(
            externalId, request.Value, request.DownvoteReasons, request.Comment), cancellationToken);
        return Ok(response);
    }

    [HttpDelete("{externalId}/vote")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> RemoveVote(
        string externalId,
        CancellationToken cancellationToken)
    {
        await _sender.Send(new RemoveHuddleVoteCommand(externalId), cancellationToken);
        return NoContent();
    }

    [HttpGet("{externalId}")]
    [ProducesResponseType(typeof(HuddleDetailResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<HuddleDetailResponse>> GetById(
        string externalId, CancellationToken cancellationToken)
    {
        HuddleDetailResponse response = await _sender.Send(
            new GetHuddleByIdQuery(externalId), cancellationToken);
        return Ok(response);
    }
}
