using System.Reflection;
using AitoWorkflowAndHuddleGenerator
    .Application
    .Common
    .Behaviors;
using FluentValidation;
using MediatR;
using Microsoft.Extensions.DependencyInjection;

namespace AitoWorkflowAndHuddleGenerator.Application;

public static class DependencyInjection
{
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

        return services;
    }
}
/*
using System.Reflection;
using Microsoft.Extensions.DependencyInjection;

namespace AitoWorkflowAndHuddleGenerator.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(
        this IServiceCollection services)
    {
        services.AddAutoMapper(
            cfg => { },
            Assembly.GetExecutingAssembly());

        return services;
    }
}*/