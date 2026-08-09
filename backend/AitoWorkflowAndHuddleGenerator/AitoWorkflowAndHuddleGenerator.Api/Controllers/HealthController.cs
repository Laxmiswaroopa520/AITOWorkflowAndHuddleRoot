using AitoWorkflowAndHuddleGenerator
    .Api
    .HealthChecks;
using AitoWorkflowAndHuddleGenerator
    .Contracts
    .Common;
using Microsoft.AspNetCore.Mvc;

namespace AitoWorkflowAndHuddleGenerator.Api.Controllers;

[ApiController]
[Route("api/health")]
public sealed class HealthController : ControllerBase
{
    private readonly DatabaseHealthCheck
        _databaseHealthCheck;

    private readonly IWebHostEnvironment
        _environment;

    public HealthController(
        DatabaseHealthCheck databaseHealthCheck,
        IWebHostEnvironment environment)
    {
        _databaseHealthCheck =
            databaseHealthCheck;

        _environment = environment;
    }

    [HttpGet]
    [ProducesResponseType<HealthResponse>(
        StatusCodes.Status200OK)]
    [ProducesResponseType<HealthResponse>(
        StatusCodes.Status503ServiceUnavailable)]
    public async Task<ActionResult<HealthResponse>>
        GetHealth(
            CancellationToken cancellationToken)
    {
        DatabaseHealthResult databaseResult =
            await _databaseHealthCheck.CheckAsync(
                cancellationToken);

        var response = new HealthResponse(
            Status: databaseResult.IsHealthy
                ? "Healthy"
                : "Degraded",

            Application:
                "AITO Workflow and Huddle " +
                "Generator API",

            Environment:
                _environment.EnvironmentName,

            TimestampUtc:
                DateTimeOffset.UtcNow,

            Database:
                new DatabaseHealthResponse(
                    Status:
                        databaseResult.IsHealthy
                            ? "Healthy"
                            : "Unhealthy",

                    Message:
                        databaseResult.Message));

        if (!databaseResult.IsHealthy)
        {
            return StatusCode(
                StatusCodes
                    .Status503ServiceUnavailable,
                response);
        }

        return Ok(response);
    }
}