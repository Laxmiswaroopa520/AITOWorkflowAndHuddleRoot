namespace AitoWorkflowAndHuddleGenerator.Api.Middleware;

/// <summary>
/// Represents the Correlation Id Middleware model.
/// </summary>
public sealed class CorrelationIdMiddleware
{
    public const string HeaderName =
        "X-Correlation-ID";

    private readonly RequestDelegate next;
    private readonly ILogger<CorrelationIdMiddleware>
        logger;

    public CorrelationIdMiddleware(
        RequestDelegate next,
        ILogger<CorrelationIdMiddleware> logger)
    {
        this.next = next;
        this.logger = logger;
    }

    /// <summary>
    /// Processes the current HTTP request.
    /// </summary>

    public async Task InvokeAsync(
        HttpContext context)
    {
        ArgumentNullException.ThrowIfNull(context);

        string correlationId =
            context.Request.Headers.TryGetValue(
                HeaderName,
                out var suppliedCorrelationId)
            && !string.IsNullOrWhiteSpace(
                suppliedCorrelationId)
                ? suppliedCorrelationId.ToString()
                : Guid.NewGuid().ToString();

        context.TraceIdentifier = correlationId;

        context.Response.Headers[HeaderName] =
            correlationId;

        using IDisposable? scope =
            logger.BeginScope(
                new Dictionary<string, object>
                {
                    ["CorrelationId"] =
                        correlationId
                });

        await next(context);
    }
}