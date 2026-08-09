using System.Security.Claims;

namespace AitoWorkflowAndHuddleGenerator.Api.Authentication;

public static class ClaimsExtensions
{
    private const string ObjectIdClaim = "oid";

    private const string LegacyObjectIdClaim =
        "http://schemas.microsoft.com/identity/claims/objectidentifier";

    private const string PreferredUsernameClaim =
        "preferred_username";

    private const string EmailClaim = "email";

    private const string UpnClaim =
        "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/upn";

    public static string? GetObjectId(
        this ClaimsPrincipal principal)
    {
        ArgumentNullException.ThrowIfNull(principal);

        return principal.FindFirstValue(ObjectIdClaim)
            ?? principal.FindFirstValue(LegacyObjectIdClaim);
    }

    public static string? GetEmail(
        this ClaimsPrincipal principal)
    {
        ArgumentNullException.ThrowIfNull(principal);

        return principal.FindFirstValue(PreferredUsernameClaim)
            ?? principal.FindFirstValue(EmailClaim)
            ?? principal.FindFirstValue(ClaimTypes.Email)
            ?? principal.FindFirstValue(UpnClaim);
    }

    public static string? GetDisplayName(
        this ClaimsPrincipal principal)
    {
        ArgumentNullException.ThrowIfNull(principal);

        return principal.FindFirstValue("name")
            ?? principal.FindFirstValue(ClaimTypes.Name);
    }

    public static IReadOnlyCollection<string> GetRoles(
        this ClaimsPrincipal principal)
    {
        ArgumentNullException.ThrowIfNull(principal);

        return principal.FindAll("roles")
            .Select(claim => claim.Value)
            .Concat(
                principal.FindAll(ClaimTypes.Role)
                    .Select(claim => claim.Value))
            .Where(role => !string.IsNullOrWhiteSpace(role))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToArray();
    }
}