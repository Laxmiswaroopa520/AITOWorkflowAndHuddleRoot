using System.Diagnostics;

namespace AitoWorkflowAndHuddleGenerator.Api.Middleware;

/// <summary>
/// Logs how long each request took, end to end inside the API process.
/// </summary>
/// <remarks>
/// This is a diagnostic aid for the "roles/audience take 10-15 seconds" investigation, registered
/// only in Development (see Program.cs). Comparing this number to the frontend's own
/// "token ms / network ms / total ms" console log for the same request tells us where the time
/// actually goes: if this middleware reports a few milliseconds but the browser sees seconds, the
/// delay is in MSAL token acquisition or the network hop, not in the API or the database. If this
/// middleware itself reports seconds, the delay is inside the request pipeline (EF Core, the
/// database round trip, or a slow downstream call) and the next step is to log EF Core command
/// timings.
/// </remarks>
public sealed class RequestTimingMiddleware
{
    private readonly RequestDelegate next;
    private readonly ILogger<RequestTimingMiddleware> logger;

    public RequestTimingMiddleware(
        RequestDelegate next,
        ILogger<RequestTimingMiddleware> logger)
    {
        this.next = next;
        this.logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        ArgumentNullException.ThrowIfNull(context);

        Stopwatch stopwatch = Stopwatch.StartNew();
        try
        {
            await next(context);
        }
        finally
        {
            stopwatch.Stop();
            logger.LogInformation(
                "[timing] {Method} {Path} -> {StatusCode} in {ElapsedMs} ms",
                context.Request.Method,
                context.Request.Path,
                context.Response.StatusCode,
                stopwatch.ElapsedMilliseconds);
        }
    }
}
