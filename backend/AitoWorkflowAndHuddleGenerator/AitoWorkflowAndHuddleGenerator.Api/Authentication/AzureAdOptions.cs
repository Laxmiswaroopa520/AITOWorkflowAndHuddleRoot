namespace AitoWorkflowAndHuddleGenerator.Api.Authentication;

public sealed class AzureAdOptions
{
    public const string SectionName = "AzureAd";

    public string Instance { get; init; } =
        "https://login.microsoftonline.com/";

    public string TenantId { get; init; } = string.Empty;

    public string ClientId { get; init; } = string.Empty;

    public string Audience { get; init; } = string.Empty;
}

/*Stores the strongly typed shape and section name of the backend
Microsoft Entra configuration.*/