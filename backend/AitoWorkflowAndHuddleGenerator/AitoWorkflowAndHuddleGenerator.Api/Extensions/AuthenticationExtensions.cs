/*Configures JWT bearer validation using Microsoft Entra tenant, authority, issuer, audience, and token-validation rules.*/

using AitoWorkflowAndHuddleGenerator.Api.Authentication;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Identity.Web;

namespace AitoWorkflowAndHuddleGenerator.Api.Extensions;

/// <summary>
/// Provides Authentication Extensions operations and constants.
/// </summary>
public static class AuthenticationExtensions
{
    /// <summary>
    /// Registers or adds Api Authentication functionality.
    /// </summary>
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
                azureAdSection)                                                 //This configures the API to work with Microsoft Entra ID access tokens.
            .EnableTokenAcquisitionToCallDownstreamApi()
            .AddInMemoryTokenCaches();

        return services;
    }
}

/*This file performs configuration only. Token validation itself is handled by the standard ASP.NET Core JWT bearer middleware and Microsoft.Identity.Web.*/
