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
/// <summary>
/// Provides authenticated Huddle catalog, detail, recommendation, and voting operations.
/// </summary>
public sealed class HuddlesController : ControllerBase
{
    private readonly ISender sender;
    /// <summary>
    /// Initializes a new instance of the <see cref="HuddlesController"/> class.
    /// </summary>
    /// <param name="sender">The mediator used to dispatch Huddle requests.</param>
    public HuddlesController(ISender sender) => this.sender = sender;

    /// <summary>
    /// Gets published Huddles that match the supplied catalog filters.
    /// </summary>
    /// <param name="filters">The Huddle catalog filters and ordering options.</param>
    /// <param name="cancellationToken">A token used to cancel the request.</param>
    /// <returns>The matching Huddle catalog items.</returns>
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<HuddleCatalogItemResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    /// <summary>
    /// Gets Catalog.
    /// </summary>
    public async Task<ActionResult<IReadOnlyList<HuddleCatalogItemResponse>>> GetCatalog(
        [FromQuery] HuddleCatalogFilterRequest filters, CancellationToken cancellationToken)
    {
        IReadOnlyList<HuddleCatalogItemResponse> response = await sender.Send(
            new GetHuddleCatalogQuery(filters.RoleExternalId, filters.FocusAreaExternalId,
                filters.AgentExternalId, filters.Type, filters.Search, filters.Sort), cancellationToken);
        return Ok(response);
    }

    /// <summary>
    /// Gets the governed seven-week recommended Huddle path for a role.
    /// </summary>
    /// <param name="roleExternalId">The role external identifier.</param>
    /// <param name="cancellationToken">A token used to cancel the request.</param>
    /// <returns>The ordered recommended Huddle path.</returns>
    [HttpGet("recommended-path")]        
    [ProducesResponseType(typeof(RecommendedHuddlePathResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    /// <summary>
    /// Gets Recommended Path.
    /// </summary>
    public async Task<ActionResult<RecommendedHuddlePathResponse>> GetRecommendedPath(
        [FromQuery] string roleExternalId, CancellationToken cancellationToken)
    {
        RecommendedHuddlePathResponse response = await sender.Send(
            new GetRecommendedPathQuery(roleExternalId), cancellationToken);
        return Ok(response);
    }

    /// <summary>
    /// Gets the authenticated user's votes for Huddle topics.
    /// </summary>
    /// <param name="cancellationToken">A token used to cancel the request.</param>
    /// <returns>The user's Huddle votes.</returns>
    [HttpGet("votes")]
    [ProducesResponseType(typeof(IReadOnlyList<HuddleVoteResponse>), StatusCodes.Status200OK)]
    /// <summary>
    /// Gets Votes.
    /// </summary>
    public async Task<ActionResult<IReadOnlyList<HuddleVoteResponse>>> GetVotes(
        CancellationToken cancellationToken)
    {
        IReadOnlyList<HuddleVoteResponse> response = await sender.Send(
            new GetHuddleVotesQuery(), cancellationToken);
        return Ok(response);
    }

    /// <summary>
    /// Creates or updates the authenticated user's vote for a Huddle.
    /// </summary>
    /// <param name="externalId">The Huddle external identifier.</param>
    /// <param name="request">The vote value and optional feedback.</param>
    /// <param name="cancellationToken">A token used to cancel the request.</param>
    /// <returns>The persisted Huddle vote.</returns>
    [HttpPut("{externalId}/vote")]
    [ProducesResponseType(typeof(HuddleVoteResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    /// <summary>
    /// Executes the Set Vote operation.
    /// </summary>
    public async Task<ActionResult<HuddleVoteResponse>> SetVote(
        string externalId,
        [FromBody] SetHuddleVoteRequest request,
        CancellationToken cancellationToken)
    {
        HuddleVoteResponse response = await sender.Send(new SetHuddleVoteCommand(
            externalId, request.Value, request.DownvoteReasons, request.Comment), cancellationToken);
        return Ok(response);
    }

    /// <summary>
    /// Removes the authenticated user's vote for a Huddle.
    /// </summary>
    /// <param name="externalId">The Huddle external identifier.</param>
    /// <param name="cancellationToken">A token used to cancel the request.</param>
    /// <returns>A response with no content after the vote is removed.</returns>
    [HttpDelete("{externalId}/vote")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    /// <summary>
    /// Executes the Remove Vote operation.
    /// </summary>
    public async Task<IActionResult> RemoveVote(
        string externalId,
        CancellationToken cancellationToken)
    {
        await sender.Send(new RemoveHuddleVoteCommand(externalId), cancellationToken);
        return NoContent();
    }

    /// <summary>
    /// Gets the complete published detail for a Huddle.
    /// </summary>
    /// <param name="externalId">The Huddle external identifier.</param>
    /// <param name="cancellationToken">A token used to cancel the request.</param>
    /// <returns>The complete Huddle detail.</returns>
    [HttpGet("{externalId}")]
    [ProducesResponseType(typeof(HuddleDetailResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    /// <summary>
    /// Gets By Id.
    /// </summary>
    public async Task<ActionResult<HuddleDetailResponse>> GetById(
        string externalId, CancellationToken cancellationToken)
    {
        HuddleDetailResponse response = await sender.Send(
            new GetHuddleByIdQuery(externalId), cancellationToken);
        return Ok(response);
    }
}
