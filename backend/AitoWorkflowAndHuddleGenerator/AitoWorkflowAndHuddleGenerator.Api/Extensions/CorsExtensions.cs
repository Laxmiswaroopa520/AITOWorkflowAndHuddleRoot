namespace AitoWorkflowAndHuddleGenerator.Api.Extensions;

public static class CorsExtensions
{
    public const string FrontendCorsPolicy =
        "FrontendCorsPolicy";

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
                "At least one frontend CORS origin " +
                "must be configured.");
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