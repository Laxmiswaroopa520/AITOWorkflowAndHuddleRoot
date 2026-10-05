using System.Reflection;
using AitoWorkflowAndHuddleGenerator
    .Application
    .Common
    .Behaviors;
using AitoWorkflowAndHuddleGenerator.Application.Features.Huddles.Plans.Common;
using FluentValidation;
using MediatR;
using Microsoft.Extensions.DependencyInjection;

namespace AitoWorkflowAndHuddleGenerator.Application;

/// <summary>
/// Provides Dependency Injection operations and constants.
/// </summary>
public static class DependencyInjection
{
    /// <summary>
    /// Registers or adds Application functionality.
    /// </summary>
    public static IServiceCollection AddApplication(
        this IServiceCollection services)
    {
        ArgumentNullException.ThrowIfNull(services);

        Assembly applicationAssembly =
            typeof(DependencyInjection).Assembly;

        services.AddMediatR(configuration =>
        {
            configuration.RegisterServicesFromAssembly(
                applicationAssembly);
        });

        services.AddValidatorsFromAssembly(
            applicationAssembly);

        services.AddTransient(
            typeof(IPipelineBehavior<,>),
            typeof(ValidationBehavior<,>));

        // Short-lived in-memory copy of the governed Role Path content (never a user's saved plan).
        services.AddMemoryCache();
        services.AddSingleton<RecommendedRolePathCache>();

        return services;
    }
}
