using Microsoft.OpenApi.Models;

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

        services.AddOpenApi(options =>
        {
            options.AddDocumentTransformer((document, _, _) =>
            {
                const string bearerScheme = "Bearer";

                document.Components ??= new OpenApiComponents();
                document.Components.SecuritySchemes[bearerScheme] =
                    new OpenApiSecurityScheme
                    {
                        Type = SecuritySchemeType.Http,
                        Scheme = "bearer",
                        BearerFormat = "JWT",
                        Description =
                            "Enter a Microsoft Entra access token. " +
                            "Swagger adds the Bearer prefix automatically."
                    };

                document.SecurityRequirements.Add(
                    new OpenApiSecurityRequirement
                    {
                        [new OpenApiSecurityScheme
                        {
                            Reference = new OpenApiReference
                            {
                                Type = ReferenceType.SecurityScheme,
                                Id = bearerScheme
                            }
                        }] = Array.Empty<string>()
                    });

                return Task.CompletedTask;
            });
        });

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
