namespace AitoWorkflowAndHuddleGenerator.Api.Extensions;

/// <summary>
/// Provides Cors Extensions operations and constants.
/// </summary>
public static class CorsExtensions
{
    public const string FrontendCorsPolicy =
        "FrontendCorsPolicy";

    /// <summary>
    /// Registers or adds Frontend Cors functionality.
    /// </summary>

    public static IServiceCollection AddFrontendCors(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        ArgumentNullException.ThrowIfNull(services);
        ArgumentNullException.ThrowIfNull(configuration);

        string[] allowedOrigins =
            configuration
                .GetSection("Cors:AllowedOrigins")
                .Get<string[]>()
            ?? [];

        if (allowedOrigins.Length == 0)
        {
            throw new InvalidOperationException(
                ConfigurationMessages.CorsOriginsRequired);
        }

        services.AddCors(options =>
        {
            options.AddPolicy(
                FrontendCorsPolicy,
                policy =>
                {
                    policy
                        .WithOrigins(allowedOrigins)
                        .AllowAnyHeader()
                        .AllowAnyMethod();
                });
        });

        return services;
    }
}