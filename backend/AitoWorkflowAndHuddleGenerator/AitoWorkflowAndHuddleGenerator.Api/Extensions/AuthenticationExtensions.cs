/*Configures JWT bearer validation using Microsoft Entra tenant, authority, issuer, audience, and token-validation rules.*/

using AitoWorkflowAndHuddleGenerator.Api.Authentication;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Identity.Web;

namespace AitoWorkflowAndHuddleGenerator.Api.Extensions;

public static class AuthenticationExtensions
{
    public static IServiceCollection AddApiAuthentication(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        ArgumentNullException.ThrowIfNull(services);
        ArgumentNullException.ThrowIfNull(configuration);

        IConfigurationSection azureAdSection =
            configuration.GetSection(
                AzureAdOptions.SectionName);

        services
            .AddOptions<AzureAdOptions>()
            .Bind(azureAdSection)
            .Validate(
                options =>
                    !string.IsNullOrWhiteSpace(options.TenantId),
                "AzureAd:TenantId is required.")
            .Validate(
                options =>
                    !string.IsNullOrWhiteSpace(options.ClientId),
                "AzureAd:ClientId is required.")
            .ValidateOnStart();

        services
            .AddAuthentication(
                JwtBearerDefaults.AuthenticationScheme)
            .AddMicrosoftIdentityWebApi(
                azureAdSection);

        return services;
    }
}

/*This file performs configuration only. Token validation itself is handled by the standard ASP.NET Core JWT bearer middleware and Microsoft.Identity.Web.*/