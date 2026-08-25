using AitoWorkflowAndHuddleGenerator.Application.Abstractions.Persistence;
using AitoWorkflowAndHuddleGenerator.Infrastructure.Persistence;
using AitoWorkflowAndHuddleGenerator.Infrastructure.Persistence.Interceptors;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using AitoWorkflowAndHuddleGenerator
    .Application
    .Abstractions
    .Identity;
using AitoWorkflowAndHuddleGenerator
    .Infrastructure
    .Identity;
using AitoWorkflowAndHuddleGenerator.Application.Abstractions.Mail;
using AitoWorkflowAndHuddleGenerator.Infrastructure.Mail;
using AitoWorkflowAndHuddleGenerator.Application.Abstractions.Coaching;
using AitoWorkflowAndHuddleGenerator.Application.Abstractions.Calendar;
using AitoWorkflowAndHuddleGenerator.Infrastructure.Calendar;
using AitoWorkflowAndHuddleGenerator.Infrastructure.Coaching;
using AitoWorkflowAndHuddleGenerator.Infrastructure.Options;

namespace AitoWorkflowAndHuddleGenerator.Infrastructure;

/// <summary>
/// Provides Dependency Injection operations and constants.
/// </summary>
public static class DependencyInjection
{
    /// <summary>
    /// Registers or adds Infrastructure functionality.
    /// </summary>
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        ArgumentNullException.ThrowIfNull(services);
        ArgumentNullException.ThrowIfNull(configuration);

        string connectionString =
            configuration.GetConnectionString(
                "DefaultConnection")
            ?? throw new InvalidOperationException(
                ConfigurationMessages.DefaultConnectionRequired);

        services.AddSingleton<AuditableEntityInterceptor>();

        services.AddDbContext<ApplicationDbContext>(
            (serviceProvider, options) =>
            {
                AuditableEntityInterceptor interceptor =
                    serviceProvider.GetRequiredService<
                        AuditableEntityInterceptor>();

                options.UseSqlServer(
                    connectionString,
                    sqlOptions =>
                    {
                        sqlOptions.MigrationsAssembly(
                            typeof(ApplicationDbContext)
                                .Assembly
                                .FullName);

                        // One statement per collection instead of one joined statement. The
                        // Huddle reads include several sibling collections, and a single joined
                        // query repeats every parent column once per combination of children,
                        // so the catalogue and Role Path reads were moving many times more
                        // bytes than the response contains.
                        sqlOptions.UseQuerySplittingBehavior(
                            QuerySplittingBehavior.SplitQuery);
                    });

                options.AddInterceptors(interceptor);
            });

        services.AddScoped<IApplicationDbContext>(
            serviceProvider =>
                serviceProvider.GetRequiredService<
                    ApplicationDbContext>());
        //added for current user service
        services.AddHttpContextAccessor();

        services.AddScoped<
            ICurrentUserService,
            CurrentUserService>();

        services.AddOptions<CoachSchedulingOptions>()
            .Bind(configuration.GetSection(CoachSchedulingOptions.SectionName));
        services.AddHttpClient(GraphCoachSchedulingService.HttpClientName, client =>
        {
            client.BaseAddress = new Uri("https://graph.microsoft.com/v1.0/");
            client.Timeout = TimeSpan.FromSeconds(30);
        });
        services.AddScoped<ICoachSchedulingService, GraphCoachSchedulingService>();
        services.AddHttpClient(GraphWorkflowCalendarService.HttpClientName, client =>
        {
            client.BaseAddress = new Uri("https://graph.microsoft.com/v1.0/");
            client.Timeout = TimeSpan.FromSeconds(30);
        });
        services.AddScoped<IWorkflowCalendarService, GraphWorkflowCalendarService>();
        services.AddHttpClient(GraphHuddleLaunchMailService.HttpClientName, client =>
        {
            client.BaseAddress = new Uri("https://graph.microsoft.com/v1.0/");
            client.Timeout = TimeSpan.FromSeconds(30);
        });
        services.AddScoped<IHuddleLaunchMailService, GraphHuddleLaunchMailService>();

        return services;
    }
}
