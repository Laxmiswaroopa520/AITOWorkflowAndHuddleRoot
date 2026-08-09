using AitoWorkflowAndHuddleGenerator.Application.Common.Exceptions;
using FluentValidation;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AitoWorkflowAndHuddleGenerator
    .Api
    .Middleware;

public sealed class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;

    private readonly
        ILogger<ExceptionHandlingMiddleware>
        _logger;

    public ExceptionHandlingMiddleware(
        RequestDelegate next,
        ILogger<ExceptionHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(
        HttpContext context)
    {
        ArgumentNullException.ThrowIfNull(context);

        try
        {
            await _next(context);
        }
        catch (ValidationException exception)
        {
            await WriteValidationProblemAsync(
                context,
                exception);
        }
        catch (Exception exception)
        {
            (int statusCode, string title) =
                MapException(exception);

            if (
                statusCode ==
                StatusCodes.Status500InternalServerError)
            {
                _logger.LogError(
                    exception,
                    "An unhandled exception occurred. " +
                    "Correlation ID: {CorrelationId}",
                    context.TraceIdentifier);

                await WriteUnexpectedProblemAsync(context);

                return;
            }

            _logger.LogWarning(
                exception,
                "A request failed with status {StatusCode}. " +
                "Correlation ID: {CorrelationId}",
                statusCode,
                context.TraceIdentifier);

            await WriteMappedProblemAsync(
                context,
                exception,
                statusCode,
                title);
        }
    }

    private static async Task
        WriteValidationProblemAsync(
            HttpContext context,
            ValidationException exception)
    {
        context.Response.StatusCode =
            StatusCodes.Status400BadRequest;

        context.Response.ContentType =
            "application/problem+json";

        Dictionary<string, string[]> errors =
            exception.Errors
                .GroupBy(error =>
                    error.PropertyName)
                .ToDictionary(
                    group => group.Key,
                    group => group
                        .Select(error =>
                            error.ErrorMessage)
                        .Distinct()
                        .ToArray());

        var problemDetails =
            new HttpValidationProblemDetails(errors)
            {
                Status =
                    StatusCodes.Status400BadRequest,

                Title =
                    "One or more validation errors occurred.",

                Instance =
                    context.Request.Path
            };

        problemDetails.Extensions[
            "correlationId"
        ] = context.TraceIdentifier;

        await context.Response.WriteAsJsonAsync(
            problemDetails);
    }

    private static async Task
        WriteMappedProblemAsync(
            HttpContext context,
            Exception exception,
            int statusCode,
            string title)
    {
        context.Response.StatusCode =
            statusCode;

        context.Response.ContentType =
            "application/problem+json";

        var problemDetails =
            new ProblemDetails
            {
                Status = statusCode,
                Title = title,
                Detail = exception.Message,
                Instance = context.Request.Path
            };

        problemDetails.Extensions[
            "correlationId"
        ] = context.TraceIdentifier;

        await context.Response.WriteAsJsonAsync(
            problemDetails,
            options: null,
            contentType: "application/problem+json");
    }

    private static async Task
        WriteUnexpectedProblemAsync(
            HttpContext context)
    {
        context.Response.StatusCode =
            StatusCodes
                .Status500InternalServerError;

        context.Response.ContentType =
            "application/problem+json";

        var problemDetails =
            new ProblemDetails
            {
                Status =
                    StatusCodes
                        .Status500InternalServerError,

                Title =
                    "An unexpected error occurred.",

                Detail =
                    "The request could not be completed. " +
                    "Use the correlation ID when " +
                    "contacting support.",

                Instance =
                    context.Request.Path
            };

        problemDetails.Extensions[
            "correlationId"
        ] = context.TraceIdentifier;

        await context.Response.WriteAsJsonAsync(
            problemDetails,
            options: null,
            contentType: "application/problem+json");
    }

    private static (
    int StatusCode,
    string Title)
    MapException(
        Exception exception)
    {
        return exception switch
        {
            FluentValidation
                .ValidationException =>
                (
                    StatusCodes
                        .Status400BadRequest,
                    "Validation failed"
                ),

            NotFoundException =>
                (
                    StatusCodes
                        .Status404NotFound,
                    "Resource not found"
                ),

            ConflictException =>
                (
                    StatusCodes
                        .Status409Conflict,
                    "Conflict"
                ),

            ForbiddenAccessException =>
                (
                    StatusCodes
                        .Status403Forbidden,
                    "Forbidden"
                ),

            UnauthorizedAccessException =>
                (
                    StatusCodes
                        .Status401Unauthorized,
                    "Unauthorized"
                ),

            DbUpdateConcurrencyException =>
                (
                    StatusCodes
                        .Status409Conflict,
                    "Concurrency conflict"
                ),

            _ =>
                (
                    StatusCodes
                        .Status500InternalServerError,
                    "An unexpected error occurred"
                ),
        };
    }
}




/*using Microsoft.AspNetCore.Mvc;

namespace AitoWorkflowAndHuddleGenerator.Api.Middleware;

public sealed class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;

    private readonly
        ILogger<ExceptionHandlingMiddleware>
        _logger;

    public ExceptionHandlingMiddleware(
        RequestDelegate next,
        ILogger<ExceptionHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(
        HttpContext context)
    {
        ArgumentNullException.ThrowIfNull(context);

        try
        {
            await _next(context);
        }
        catch (Exception exception)
        {
            _logger.LogError(
                exception,
                "An unhandled exception occurred. " +
                "Correlation ID: {CorrelationId}",
                context.TraceIdentifier);

            await WriteProblemDetailsAsync(context);
        }
    }

    private static async Task
        WriteProblemDetailsAsync(
            HttpContext context)
    {
        context.Response.StatusCode =
            StatusCodes.Status500InternalServerError;

        context.Response.ContentType =
            "application/problem+json";

        var problemDetails = new ProblemDetails
        {
            Status =
                StatusCodes
                    .Status500InternalServerError,

            Title =
                "An unexpected error occurred.",

            Detail =
                "The request could not be completed. " +
                "Use the correlation ID when " +
                "contacting support.",

            Instance =
                context.Request.Path
        };

        problemDetails.Extensions["correlationId"] =
            context.TraceIdentifier;

        await context.Response.WriteAsJsonAsync(
            problemDetails,
            options: null,
            contentType: "application/problem+json");
    }
}
*/
