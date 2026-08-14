namespace AitoWorkflowAndHuddleGenerator.Api.Extensions;

/// <summary>
/// Provides Swagger Extensions operations and constants.
/// </summary>
public static class SwaggerExtensions
{
    /// <summary>
    /// Registers or adds Swagger Documentation functionality.
    /// </summary>
    public static IServiceCollection
        AddSwaggerDocumentation(
            this IServiceCollection services)
    {
        ArgumentNullException.ThrowIfNull(services);

        services.AddOpenApi();

        return services;
    }

    /// <summary>
    /// Executes the Use Swagger Documentation operation.
    /// </summary>

    public static WebApplication
        UseSwaggerDocumentation(
            this WebApplication app)
    {
        ArgumentNullException.ThrowIfNull(app);

        if (app.Environment.IsDevelopment())
        {
            app.MapOpenApi();

            app.UseSwaggerUI(options =>
            {
                options.SwaggerEndpoint(
                    "/openapi/v1.json",
                    "AITO Workflow and Huddle " +
                    "Generator API v1");

                options.RoutePrefix = "swagger";
            });
        }

        return app;
    }
}