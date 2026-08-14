namespace AitoWorkflowAndHuddleGenerator.Api.Extensions;

/// <summary>
/// Provides Service Collection Extensions operations and constants.
/// </summary>
public static class ServiceCollectionExtensions
{
    /// <summary>
    /// Registers or adds Api Services functionality.
    /// </summary>
    public static IServiceCollection AddApiServices(
        this IServiceCollection services)
    {
        ArgumentNullException.ThrowIfNull(services);

        services.AddControllers();
        services.AddProblemDetails();

        return services;
    }
}
