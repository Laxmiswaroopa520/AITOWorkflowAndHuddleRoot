using AitoWorkflowAndHuddleGenerator
    .Application
    .Abstractions
    .Identity;
using Microsoft.AspNetCore.Http;
using System.Security.Claims;

namespace AitoWorkflowAndHuddleGenerator
    .Infrastructure
    .Identity;

public sealed class CurrentUserService
    : ICurrentUserService
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CurrentUserService(
        IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    private ClaimsPrincipal? User =>
        _httpContextAccessor.HttpContext?.User;

    public bool IsAuthenticated =>
        User?.Identity?.IsAuthenticated == true;

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