using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using AitoWorkflowAndHuddleGenerator.Application.Abstractions.Calendar;
using AitoWorkflowAndHuddleGenerator.Application.Common.Exceptions;
using AitoWorkflowAndHuddleGenerator.Contracts.Workflows.Calendar;
using Microsoft.Extensions.Logging;
using Microsoft.Identity.Web;

namespace AitoWorkflowAndHuddleGenerator.Infrastructure.Calendar;

/// <summary>
/// This GraphWorkflowCalendarService is the Infrastructure implementation that talks to Microsoft Graph and 
/// creates workflow events in the currently signed-in user's Outlook calendar.
/// </summary>
public sealed class GraphWorkflowCalendarService(
    IHttpClientFactory httpClientFactory,
    ITokenAcquisition tokenAcquisition,
    ILogger<GraphWorkflowCalendarService> logger) : IWorkflowCalendarService
{
    public const string HttpClientName = "WorkflowMicrosoftGraph";

    /// <summary>
    /// Registers or adds Events Async functionality.
    /// </summary>

    public async Task<AddWorkflowCalendarEventsResponse> AddEventsAsync(IReadOnlyList<WorkflowCalendarEventRequest> events, CancellationToken cancellationToken)
    {
        string token;
        try
        {
            token = await tokenAcquisition.GetAccessTokenForUserAsync(
                ["Calendars.ReadWrite"]);
        }
        catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
        {
            throw;
        }
        catch (Exception exception)
        {
            logger.LogError(
                exception,
                "Microsoft Graph token acquisition failed for Workflow calendar synchronization.");

            throw new ExternalServiceUnavailableException(
                MicrosoftGraphMessages.CalendarAuthorizationUnavailable,
                exception);
        }
        HttpClient client = httpClientFactory.CreateClient(HttpClientName);
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
        List<string> ids = [];
        foreach (WorkflowCalendarEventRequest item in events)
        {
            var payload = new
            {
                subject = item.Subject.Trim(),
                body = new { contentType = "text", content = item.Body?.Trim() ?? string.Empty },
                start = new { dateTime = EnsureUtc(item.StartUtc).ToString("yyyy-MM-ddTHH:mm:ss"), timeZone = "UTC" },
                end = new { dateTime = EnsureUtc(item.EndUtc).ToString("yyyy-MM-ddTHH:mm:ss"), timeZone = "UTC" },
                transactionId = item.RequestId.ToString("D")
            };
            using HttpResponseMessage response = await client.PostAsJsonAsync("me/events", payload, cancellationToken);
            string content = await response.Content.ReadAsStringAsync(cancellationToken);
            if (!response.IsSuccessStatusCode) throw new ExternalServiceUnavailableException(MicrosoftGraphMessages.CalendarRequestFailed((int)response.StatusCode));
            using JsonDocument document = JsonDocument.Parse(content);
            ids.Add(document.RootElement.GetProperty("id").GetString() ?? throw new ExternalServiceUnavailableException(MicrosoftGraphMessages.EventIdMissing));
        }
        return new AddWorkflowCalendarEventsResponse(ids.Count, ids);
    }

    private static DateTime EnsureUtc(DateTime value) => value.Kind == DateTimeKind.Utc ? value : value.ToUniversalTime();
}
