/*Configures JWT bearer validation using Microsoft Entra tenant, authority, issuer, audience, and token-validation rules.*/

using AitoWorkflowAndHuddleGenerator.Api.Authentication;
using Microsoft.Identity.ServiceEssentials.Authentication.AspNet;
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

        // WI-12: inbound authentication is handled by MISE v2.0. MISE reads its own
        // configuration directly from the "AzureAd" section of the root configuration
        // (MiseVersion, AzureAd:Audiences, AzureAd:Protocols:Bearer:TokenTypes:AccessToken).
        services
            .AddAuthentication(
                MiseAuthenticationDefaults.AuthenticationScheme)
            .AddMiseWithDefaultModules(configuration);

        // Outbound delegated Microsoft Graph token acquisition continues to be provided by
        // Microsoft.Identity.Web, independent of the inbound authentication handler above.
        // AddMicrosoftIdentityWebApi() is intentionally NOT called here, since MISE now owns
        // inbound authentication (WI-12, Decision 1). AddTokenAcquisition() and
        // AddInMemoryTokenCaches() are standalone IServiceCollection extension methods
        // (Microsoft.Identity.Web.TokenAcquisition / Microsoft.Identity.Web.TokenCache) that do
        // not require AddMicrosoftIdentityWebApi() to be registered first. GraphWorkflowCalendarService,
        // GraphHuddleLaunchMailService, and GraphCoachSchedulingService continue to resolve
        // ITokenAcquisition and call GetAccessTokenForUserAsync(...) exactly as before.
        services.AddTokenAcquisition();
        services.AddInMemoryTokenCaches();

        return services;
    }
}

/*This file performs configuration only. Token validation itself is handled by the standard ASP.NET Core JWT bearer middleware and Microsoft.Identity.Web.*/
