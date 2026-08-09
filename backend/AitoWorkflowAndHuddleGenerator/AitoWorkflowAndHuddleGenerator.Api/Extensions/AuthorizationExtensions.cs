using AitoWorkflowAndHuddleGenerator.Api.Authorization;
using Microsoft.Identity.Web;

namespace AitoWorkflowAndHuddleGenerator.Api.Extensions;

public static class AuthorizationExtensions
{
    private const string RequiredScope = "access_as_user";

    public static IServiceCollection AddApiAuthorization(
        this IServiceCollection services)
    {
        ArgumentNullException.ThrowIfNull(services);

        services.AddAuthorization(options =>
        {
            options.AddPolicy(
                Policies.AccessAsUser,
                policy =>
                {
                    policy.RequireAuthenticatedUser();
                    policy.RequireScope(RequiredScope);
                });
        });

        return services;
    }
}


/*Registers authorization policies such as requiring an authenticated user and the access_as_user delegated scope.*/


/*This policy checks two things:

1. The request represents an authenticated caller.
2. The token contains access_as_user in the scp claim.*/