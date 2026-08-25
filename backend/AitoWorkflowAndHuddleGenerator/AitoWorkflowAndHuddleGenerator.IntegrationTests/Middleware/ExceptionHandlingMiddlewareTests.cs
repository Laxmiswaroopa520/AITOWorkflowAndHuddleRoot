using System.Net;
using System.Text.Json;
using AitoWorkflowAndHuddleGenerator.Api.Middleware;
using AitoWorkflowAndHuddleGenerator.Application.Common.Exceptions;
using FluentValidation;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
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
}
