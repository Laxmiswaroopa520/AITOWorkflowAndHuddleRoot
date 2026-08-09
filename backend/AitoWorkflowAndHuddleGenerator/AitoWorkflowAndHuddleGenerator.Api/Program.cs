using AitoWorkflowAndHuddleGenerator.Api.Extensions;
using AitoWorkflowAndHuddleGenerator.Api.Middleware;
using AitoWorkflowAndHuddleGenerator.Application;
using AitoWorkflowAndHuddleGenerator.Infrastructure;

WebApplicationBuilder builder =
    WebApplication.CreateBuilder(args);

// API-level registrations:
// Controllers, OpenAPI, CORS and Swagger UI.
builder.Services
    .AddApiServices()
    .AddFrontendCors(builder.Configuration)
    .AddSwaggerDocumentation();

// Application layer:
// MediatR, validation and mapping.
builder.Services.AddApplication();

// Infrastructure layer:
// EF Core, database, auditing and current-user service.
builder.Services.AddInfrastructure(
    builder.Configuration);

// Microsoft Entra ID JWT bearer authentication.
builder.Services.AddApiAuthentication(
    builder.Configuration);

// Authorization policies such as AccessAsUser.
builder.Services.AddApiAuthorization();

WebApplication app = builder.Build();

// Adds or propagates a correlation ID for each request.
app.UseMiddleware<CorrelationIdMiddleware>();

// Converts unhandled exceptions into consistent API responses.
app.UseMiddleware<ExceptionHandlingMiddleware>();

// OpenAPI document and Swagger UI.
app.UseSwaggerDocumentation();

// Redirect HTTP requests to HTTPS.
app.UseHttpsRedirection();

// Enables endpoint routing.
app.UseRouting();

// CORS must execute before authentication and authorization
// so that the React frontend can call the API.
app.UseCors(
    CorsExtensions.FrontendCorsPolicy);

// Reads and validates the bearer access token.
// When valid, it creates HttpContext.User.
app.UseAuthentication();

// Checks [Authorize] attributes and authorization policies.
app.UseAuthorization();

// Maps attribute-routed API controllers.
app.MapControllers();

app.Run();

// Required for WebApplicationFactory integration tests.
public partial class Program;



















/*using AitoWorkflowAndHuddleGenerator.Api.Extensions;
using AitoWorkflowAndHuddleGenerator.Api.Middleware;
using AitoWorkflowAndHuddleGenerator.Application;
using AitoWorkflowAndHuddleGenerator.Infrastructure;

WebApplicationBuilder builder =
    WebApplication.CreateBuilder(args);

builder.Services
    .AddApiServices()
    .AddFrontendCors(builder.Configuration)
    .AddSwaggerDocumentation();

builder.Services.AddApplication();

builder.Services.AddInfrastructure(
    builder.Configuration);

WebApplication app = builder.Build();

app.UseMiddleware<CorrelationIdMiddleware>();

app.UseMiddleware<ExceptionHandlingMiddleware>();

app.UseSwaggerDocumentation();

app.UseHttpsRedirection();

app.UseRouting();

app.UseCors(
    CorsExtensions.FrontendCorsPolicy);

// Authentication will be added later.
// app.UseAuthentication();

// Authorization will be added later.
// app.UseAuthorization();

app.MapControllers();

app.Run();

public partial class Program;

*/