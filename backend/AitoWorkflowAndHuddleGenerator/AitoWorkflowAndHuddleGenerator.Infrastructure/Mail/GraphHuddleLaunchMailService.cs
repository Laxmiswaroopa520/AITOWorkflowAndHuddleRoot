using System.Net.Http.Headers;
using System.Reflection;
using System.Text.Json;
using AitoWorkflowAndHuddleGenerator.Application.Abstractions.Mail;
using AitoWorkflowAndHuddleGenerator.Application.Common.Exceptions;
using AitoWorkflowAndHuddleGenerator.Contracts.Huddles;
using Microsoft.Extensions.Logging;
using Microsoft.Identity.Web;

namespace AitoWorkflowAndHuddleGenerator.Infrastructure.Mail;

/// <summary>
/// Creates the branded Frontier Accelerator launch email as a draft in the signed-in user's
/// mailbox through Microsoft Graph.
/// </summary>
/// <remarks>
/// A draft is created rather than sent, so the user always reviews and addresses it. The
/// banner travels as an inline attachment referenced by Content-ID, matching the approved
/// email template; a remote image would be blocked by default in most mail clients.
/// </remarks>
public sealed class GraphHuddleLaunchMailService(
    IHttpClientFactory httpClientFactory,
    ITokenAcquisition tokenAcquisition,
    ILogger<GraphHuddleLaunchMailService> logger) : IHuddleLaunchMailService
{
    public const string HttpClientName = "HuddleLaunchMicrosoftGraph";

    private const string BannerResourceName =
        "AitoWorkflowAndHuddleGenerator.Infrastructure.Mail.Assets.frontier-huddle-banner.jpg";
    private const string BannerContentId = "frontier-huddle-banner";
    private const string BannerFileName = "frontier-huddle-banner.jpg";

    /// <summary>
    /// Creates the launch draft and returns the link that opens it in Outlook on the web.
    /// </summary>
    public async Task<HuddleLaunchEmailDraftResponse> CreateLaunchDraftAsync(
        CreateHuddleLaunchEmailDraftRequest request,
        CancellationToken cancellationToken)
    {
        string token;
        try
        {
            token = await tokenAcquisition.GetAccessTokenForUserAsync(["Mail.ReadWrite"]);
        }
        catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
        {
            throw;
        }
        catch (Exception exception)
        {
            logger.LogError(
                exception,
                "Microsoft Graph token acquisition failed for the Huddle launch email draft.");

            throw new ExternalServiceUnavailableException(
                MicrosoftGraphMessages.MailAuthorizationUnavailable,
                exception);
        }

        HttpClient client = httpClientFactory.CreateClient(HttpClientName);
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var payload = new
        {
            subject = request.Subject.Trim(),
            body = new { contentType = "html", content = BuildHtmlBody(request.BodyText) },
            attachments = new object[]
            {
                new
                {
                    // Graph requires the OData type discriminator on attachment payloads.
                    @odata_type = "#microsoft.graph.fileAttachment",
                    name = BannerFileName,
                    contentType = "image/jpeg",
                    contentId = BannerContentId,
                    isInline = true,
                    contentBytes = Convert.ToBase64String(ReadBanner()),
                },
            },
        };

        // The anonymous type cannot express "@odata.type", so the property is renamed on the way out.
        string json = JsonSerializer.Serialize(payload).Replace("\"odata_type\"", "\"@odata.type\"");
        using var content = new StringContent(json, System.Text.Encoding.UTF8, "application/json");
        using HttpResponseMessage response = await client.PostAsync("me/messages", content, cancellationToken);
        string responseBody = await response.Content.ReadAsStringAsync(cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            logger.LogError(
                "Microsoft Graph rejected the Huddle launch draft with status {StatusCode}.",
                (int)response.StatusCode);

            throw new ExternalServiceUnavailableException(
                MicrosoftGraphMessages.MailRequestFailed((int)response.StatusCode));
        }

        using JsonDocument document = JsonDocument.Parse(responseBody);
        string messageId = ReadProperty(document, "id");
        string webLink = ReadProperty(document, "webLink");
        return new HuddleLaunchEmailDraftResponse(messageId, webLink);
    }

    private static string ReadProperty(JsonDocument document, string propertyName) =>
        document.RootElement.TryGetProperty(propertyName, out JsonElement value)
        && value.GetString() is { Length: > 0 } text
            ? text
            : throw new ExternalServiceUnavailableException(
                MicrosoftGraphMessages.ResponsePropertyMissing(propertyName));

    /// <summary>
    /// Wraps the personalized plain text in the branded shell: banner first, then the message.
    /// </summary>
    private static string BuildHtmlBody(string bodyText)
    {
        string paragraphs = string.Join(
            string.Empty,
            bodyText.Replace("\r\n", "\n").Split("\n\n", StringSplitOptions.RemoveEmptyEntries)
                .Select(block => $"<p style=\"margin:0 0 16px;\">{Encode(block).Replace("\n", "<br />")}</p>"));

        return $"""
            <div style="font-family:'Segoe UI',Arial,sans-serif;font-size:14px;line-height:22px;color:#242424;">
              <img src="cid:{BannerContentId}" alt="Frontier Huddle" width="700" style="display:block;width:100%;max-width:700px;height:auto;border:0;" />
              <div style="padding:20px 0 0;max-width:700px;">{paragraphs}</div>
            </div>
            """;
    }

    /// <summary>
    /// Minimal HTML escaping so personalized names and team names cannot inject markup.
    /// </summary>
    private static string Encode(string value) => value
        .Replace("&", "&amp;")
        .Replace("<", "&lt;")
        .Replace(">", "&gt;");

    private static byte[] ReadBanner()
    {
        using Stream? stream = Assembly.GetExecutingAssembly().GetManifestResourceStream(BannerResourceName)
            ?? throw new ExternalServiceUnavailableException(MicrosoftGraphMessages.MailBannerMissing);
        using var buffer = new MemoryStream();
        stream.CopyTo(buffer);
        return buffer.ToArray();
    }
}
