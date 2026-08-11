using AitoWorkflowAndHuddleGenerator.Api.Authorization;
using AitoWorkflowAndHuddleGenerator.Application.Features.Huddles.Catalog.Queries.GetHuddleById;
using AitoWorkflowAndHuddleGenerator.Application.Features.Huddles.Catalog.Queries.GetHuddleCatalog;
using AitoWorkflowAndHuddleGenerator.Application.Features.Huddles.Catalog.Queries.GetRecommendedPath;
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
