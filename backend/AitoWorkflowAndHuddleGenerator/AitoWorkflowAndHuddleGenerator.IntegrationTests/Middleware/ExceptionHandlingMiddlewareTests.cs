using System.Net;
using System.Text.Json;
using AitoWorkflowAndHuddleGenerator.Api.Middleware;
using AitoWorkflowAndHuddleGenerator.Application.Common.Exceptions;
using FluentValidation;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Logging.Abstractions;

namespace AitoWorkflowAndHuddleGenerator.IntegrationTests.Middleware;

public sealed class ExceptionHandlingMiddlewareTests
{
    public static TheoryData<Exception, HttpStatusCode> MappedExceptions =>
        new()
        {
            {
                new UnauthorizedAccessException("Missing user claim."),
                HttpStatusCode.Unauthorized
            },
            {
                new ForbiddenAccessException("Access denied."),
                HttpStatusCode.Forbidden
            },
            {
                new NotFoundException("Resource missing."),
                HttpStatusCode.NotFound
            },
            {
                new ConflictException("Resource conflict."),
                HttpStatusCode.Conflict
            },
            {
                new DbUpdateConcurrencyException("Stale row version."),
                HttpStatusCode.Conflict
            },
        };

    [Theory]
    [MemberData(nameof(MappedExceptions))]
    public async Task InvokeAsync_MapsExpectedExceptionToProblemDetails(
        Exception exception,
        HttpStatusCode expectedStatus)
    {
        DefaultHttpContext context = CreateContext();
        var middleware = CreateMiddleware(exception);

        await middleware.InvokeAsync(context);

        Assert.Equal((int)expectedStatus, context.Response.StatusCode);
        Assert.Equal("application/problem+json", context.Response.ContentType);

        JsonElement body = await ReadResponseAsync(context);

        Assert.Equal((int)expectedStatus, body.GetProperty("status").GetInt32());
        Assert.Equal(exception.Message, body.GetProperty("detail").GetString());
        Assert.True(body.TryGetProperty("correlationId", out _));
    }

    [Fact]
    public async Task InvokeAsync_MapsValidationExceptionToBadRequest()
    {
        var exception = new ValidationException(
            [new FluentValidation.Results.ValidationFailure("Name", "Name is required.")]);

        DefaultHttpContext context = CreateContext();
        var middleware = CreateMiddleware(exception);

        await middleware.InvokeAsync(context);

        Assert.Equal(StatusCodes.Status400BadRequest, context.Response.StatusCode);

        JsonElement body = await ReadResponseAsync(context);

        Assert.Equal(
            "Name is required.",
            body.GetProperty("errors").GetProperty("Name")[0].GetString());
    }

    [Fact]
    public async Task InvokeAsync_MapsUnexpectedExceptionToInternalServerError()
    {
        DefaultHttpContext context = CreateContext();
        var middleware = CreateMiddleware(new InvalidOperationException("Sensitive detail."));

        await middleware.InvokeAsync(context);

        Assert.Equal(
            StatusCodes.Status500InternalServerError,
            context.Response.StatusCode);

        JsonElement body = await ReadResponseAsync(context);

        Assert.Equal(
            "An unexpected error occurred.",
            body.GetProperty("title").GetString());
        Assert.DoesNotContain("Sensitive detail", body.ToString());
    }

    // WI-05: proves both halves of the "safe to the client, fully logged on the server" contract
    // together, against a payload shaped like a real secret (connection string + password) rather
    // than a generic placeholder string. The earlier test above already showed the *response*
    // doesn't leak "Sensitive detail" -- this one additionally proves the *actual* exception
    // instance (not a sanitized copy, not just its type) reaches the logger, which none of the
    // existing tests checked: they all construct the middleware with NullLogger, which discards
    // everything it's given.
    [Fact]
    public async Task InvokeAsync_HidesSensitiveDetailFromClientButLogsTheRealExceptionServerSide()
    {
        var sensitiveException = new InvalidOperationException(
            "Failed executing DbCommand. Connection: " +
            "Server=sql-prod-01;Database=Aito;User Id=sa;Password=Sup3rSecret!;");

        var capturingLogger = new CapturingLogger<ExceptionHandlingMiddleware>();
        var middleware = new ExceptionHandlingMiddleware(
            _ => Task.FromException(sensitiveException),
            capturingLogger);

        DefaultHttpContext context = CreateContext();

        await middleware.InvokeAsync(context);

        // Client: generic response only. No connection string, no password, no exception type
        // name, regardless of environment -- this middleware has no
        // IWebHostEnvironment.IsDevelopment() branch, so there is no way for a Development build
        // to accidentally relax this.
        Assert.Equal(
            StatusCodes.Status500InternalServerError,
            context.Response.StatusCode);

        JsonElement body = await ReadResponseAsync(context);
        string rawBody = body.ToString();

        Assert.Equal("An unexpected error occurred.", body.GetProperty("title").GetString());
        Assert.DoesNotContain("Sup3rSecret!", rawBody);
        Assert.DoesNotContain("Password=", rawBody);
        Assert.DoesNotContain("sql-prod-01", rawBody);
        Assert.DoesNotContain(nameof(InvalidOperationException), rawBody);

        // Server log: the real exception object, sensitive detail and all, must still reach the
        // logger so a developer can actually diagnose the failure.
        (LogLevel Level, EventId EventId, Exception? Exception, string Message) errorEntry =
            Assert.Single(
                capturingLogger.Entries,
                entry => entry.Level == LogLevel.Error);

        Assert.Same(sensitiveException, errorEntry.Exception);
        Assert.Contains("Sup3rSecret!", errorEntry.Exception!.Message);
    }

    [Fact]
    public async Task InvokeAsync_DoesNotWriteAnErrorForClientCancelledRequest()
    {
        using var cancellationTokenSource = new CancellationTokenSource();
        cancellationTokenSource.Cancel();

        DefaultHttpContext context = CreateContext();
        context.RequestAborted = cancellationTokenSource.Token;

        var middleware = CreateMiddleware(
            new OperationCanceledException(cancellationTokenSource.Token));

        await middleware.InvokeAsync(context);

        Assert.Equal(StatusCodes.Status200OK, context.Response.StatusCode);
        Assert.Equal(0, context.Response.Body.Length);
    }

    [Fact]
    public async Task InvokeAsync_DoesNotHideUnrelatedOperationCancellation()
    {
        DefaultHttpContext context = CreateContext();
        var middleware = CreateMiddleware(new OperationCanceledException());

        await middleware.InvokeAsync(context);

        Assert.Equal(
            StatusCodes.Status500InternalServerError,
            context.Response.StatusCode);
    }

    private static ExceptionHandlingMiddleware CreateMiddleware(
        Exception exception)
    {
        return new ExceptionHandlingMiddleware(
            _ => Task.FromException(exception),
            NullLogger<ExceptionHandlingMiddleware>.Instance);
    }

    private static DefaultHttpContext CreateContext()
    {
        var context = new DefaultHttpContext();
        context.Request.Path = "/api/test";
        context.Response.Body = new MemoryStream();
        context.TraceIdentifier = "part-8-test";

        return context;
    }

    private static async Task<JsonElement> ReadResponseAsync(
        DefaultHttpContext context)
    {
        context.Response.Body.Position = 0;

        using JsonDocument document =
            await JsonDocument.ParseAsync(context.Response.Body);

        return document.RootElement.Clone();
    }

    /// <summary>
    /// Minimal <see cref="ILogger{T}"/> test double that records every call it receives, so a
    /// test can assert on what was logged. The project has no mocking library installed
    /// (Moq/NSubstitute), so this is hand-rolled rather than pulling one in for a single test.
    /// </summary>
    private sealed class CapturingLogger<T> : ILogger<T>
    {
        public List<(LogLevel Level, EventId EventId, Exception? Exception, string Message)>
            Entries { get; } = [];

        public IDisposable? BeginScope<TState>(TState state)
            where TState : notnull => null;

        public bool IsEnabled(LogLevel logLevel) => true;

        public void Log<TState>(
            LogLevel logLevel,
            EventId eventId,
            TState state,
            Exception? exception,
            Func<TState, Exception?, string> formatter)
        {
            Entries.Add((logLevel, eventId, exception, formatter(state, exception)));
        }
    }
}
