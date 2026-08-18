using AitoWorkflowAndHuddleGenerator
    .Infrastructure
    .Persistence;
using Microsoft.EntityFrameworkCore;

namespace AitoWorkflowAndHuddleGenerator
    .Api
    .HealthChecks;

public sealed class DatabaseHealthCheck
{
    private readonly ApplicationDbContext _dbContext;
    private readonly ILogger<DatabaseHealthCheck> _logger;

    public DatabaseHealthCheck(
        ApplicationDbContext dbContext,
        ILogger<DatabaseHealthCheck> logger)
    {
        _dbContext = dbContext;
        _logger = logger;
    }

    public async Task<DatabaseHealthResult> CheckAsync(
        CancellationToken cancellationToken = default)
    {
        try
        {
            bool canConnect =
                await _dbContext.Database.CanConnectAsync(
                    cancellationToken);

            return canConnect
                ? new DatabaseHealthResult(
                    true,
                    "Database connection succeeded.")
                : new DatabaseHealthResult(
                    false,
                    "Database connection failed.");
        }
        catch (Exception exception)
        {
            _logger.LogError(
                exception,
                "The database health check failed.");

            return new DatabaseHealthResult(
                false,
                "Database connection could not be established.");
        }
    }
}

public sealed record DatabaseHealthResult(
    bool IsHealthy,
    string Message);