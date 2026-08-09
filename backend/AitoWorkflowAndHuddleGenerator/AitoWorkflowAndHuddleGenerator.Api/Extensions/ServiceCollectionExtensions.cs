using AitoWorkflowAndHuddleGenerator
    .Api
    .HealthChecks;

namespace AitoWorkflowAndHuddleGenerator.Api.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddApiServices(
        this IServiceCollection services)
    {
        ArgumentNullException.ThrowIfNull(services);

        services.AddControllers();
        services.AddProblemDetails();
        services.AddScoped<DatabaseHealthCheck>();

        return services;
    }
}