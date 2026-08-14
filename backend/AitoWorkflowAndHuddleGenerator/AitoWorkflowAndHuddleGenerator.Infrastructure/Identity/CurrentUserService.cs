using AitoWorkflowAndHuddleGenerator
    .Application
    .Abstractions
    .Identity;
using Microsoft.AspNetCore.Http;
using System.Security.Claims;

namespace AitoWorkflowAndHuddleGenerator
    .Infrastructure
    .Identity;
//This class is used to read the currently logged-in user's info from the authenticated HTTP Request.
/// <summary>
/// Provides Current User operations.
/// </summary>
public sealed class CurrentUserService
    : ICurrentUserService
{
    /// <summary>
    /// HttpContextAccessor is used to access the current HTTP context, which contains information about the authenticated user.
    /// </summary>
    private readonly IHttpContextAccessor httpContextAccessor;

    public CurrentUserService(
        IHttpContextAccessor httpContextAccessor)
    {
        this.httpContextAccessor = httpContextAccessor;
    }

    private ClaimsPrincipal? User =>
        httpContextAccessor.HttpContext?.User;

    public bool IsAuthenticated =>
        User?.Identity?.IsAuthenticated == true;


    //gets the user's microsoft entra object id
    public string? ObjectId =>
        FindClaim(
            "oid",
            "http://schemas.microsoft.com/identity/claims/objectidentifier");

    public string? Email =>
        FindClaim(
            "preferred_username",
            "email",
            ClaimTypes.Email,
            "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/upn");

    public string? DisplayName =>
        FindClaim(
            "name",
            ClaimTypes.Name);
    //get all roles assigned to the current user.
    public IReadOnlyCollection<string> Roles =>
        User?
            .FindAll("roles")
            .Select(claim => claim.Value)
            .Concat(
                User.FindAll(ClaimTypes.Role)
                    .Select(claim => claim.Value))
            .Where(role => !string.IsNullOrWhiteSpace(role))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToArray()
        ?? [];

    private string? FindClaim(
        params string[] claimTypes)
    {
        if (User is null)
        {
            return null;
        }

        foreach (string claimType in claimTypes)
        {
            string? value =
                User.FindFirst(claimType)?.Value;

            if (!string.IsNullOrWhiteSpace(value))
            {
                return value;
            }
        }

        return null;
    }
}