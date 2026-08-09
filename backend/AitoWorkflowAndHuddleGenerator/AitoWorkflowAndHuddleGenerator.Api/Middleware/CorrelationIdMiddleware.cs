namespace AitoWorkflowAndHuddleGenerator.Api.Middleware;

public sealed class CorrelationIdMiddleware
{
    public const string HeaderName =
        "X-Correlation-ID";

    private readonly RequestDelegate _next;
    private readonly ILogger<CorrelationIdMiddleware>
        _logger;

    public CorrelationIdMiddleware(
        RequestDelegate next,
        ILogger<CorrelationIdMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

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
            _logger.BeginScope(
                new Dictionary<string, object>
                {
                    ["CorrelationId"] =
                        correlationId
                });

        await _next(context);
    }
}