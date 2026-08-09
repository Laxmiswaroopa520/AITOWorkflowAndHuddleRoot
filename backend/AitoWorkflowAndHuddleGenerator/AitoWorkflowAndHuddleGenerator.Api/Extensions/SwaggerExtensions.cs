namespace AitoWorkflowAndHuddleGenerator.Api.Extensions;

public static class SwaggerExtensions
{
    public static IServiceCollection
        AddSwaggerDocumentation(
            this IServiceCollection services)
    {
        ArgumentNullException.ThrowIfNull(services);

        services.AddOpenApi();

        return services;
    }

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