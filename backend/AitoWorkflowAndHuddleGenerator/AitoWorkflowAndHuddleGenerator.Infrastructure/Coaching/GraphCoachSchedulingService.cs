using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using AitoWorkflowAndHuddleGenerator.Application.Abstractions.Coaching;
using AitoWorkflowAndHuddleGenerator.Application.Abstractions.Identity;
using AitoWorkflowAndHuddleGenerator.Application.Common.Exceptions;
using AitoWorkflowAndHuddleGenerator.Contracts.Huddles.Coaching;
using AitoWorkflowAndHuddleGenerator.Infrastructure.Options;
using Microsoft.Extensions.Options;
using Microsoft.Identity.Web;

namespace AitoWorkflowAndHuddleGenerator.Infrastructure.Coaching;

public sealed class GraphCoachSchedulingService(
    IHttpClientFactory httpClientFactory,
    ITokenAcquisition tokenAcquisition,
    ICurrentUserService currentUser,
    IOptions<CoachSchedulingOptions> options) : ICoachSchedulingService
{
    public const string HttpClientName = "CoachMicrosoftGraph";
    private const int AvailabilityIntervalMinutes = 15;
    private readonly CoachSchedulingOptions _options = options.Value;

    public Task<IReadOnlyList<CoachResponse>> GetCoachesAsync(string? huddleExternalId, CancellationToken cancellationToken)
    {
        EnsureDirectoryConfigured();
        IReadOnlyList<CoachResponse> coaches = _options.Coaches
            .Where(x => x.Active && (string.IsNullOrWhiteSpace(huddleExternalId) || x.SupportedHuddleExternalIds.Length == 0 || x.SupportedHuddleExternalIds.Contains(huddleExternalId, StringComparer.OrdinalIgnoreCase)))
            .OrderBy(x => x.DisplayName)
            .Select(ToResponse)
            .ToList();
        return Task.FromResult(coaches);
    }

    public async Task<CoachAvailabilityResponse> GetAvailabilityAsync(string coachExternalId, DateTime startUtc, DateTime endUtc, int durationMinutes, CancellationToken cancellationToken)
    {
        CoachOptions coach = FindCoach(coachExternalId);
        ValidateWindow(startUtc, endUtc, durationMinutes);
        string userEmail = currentUser.Email ?? throw new UnauthorizedAccessException("The authenticated token does not contain an email claim.");
        IReadOnlyDictionary<string, string> views = await GetScheduleViewsAsync([userEmail, coach.Email], startUtc, endUtc, cancellationToken);
        List<CoachAvailabilitySlotResponse> slots = CreateMutuallyAvailableSlots(coach, views, startUtc, endUtc, durationMinutes);
        return new CoachAvailabilityResponse(coach.ExternalId, coach.TimeZone, slots);
    }

    public async Task<CoachBookingResponse> BookAsync(string coachExternalId, string huddleExternalId, string huddleName, DateTime startUtc, DateTime endUtc, string displayTimeZone, string? question, Guid bookingRequestId, CancellationToken cancellationToken)
    {
        CoachOptions coach = FindCoach(coachExternalId);
        int duration = checked((int)(endUtc - startUtc).TotalMinutes);
        CoachAvailabilityResponse availability = await GetAvailabilityAsync(coachExternalId, startUtc, endUtc, duration, cancellationToken);
        if (!availability.Slots.Any(x => x.StartUtc == EnsureUtc(startUtc) && x.EndUtc == EnsureUtc(endUtc)))
            throw new ConflictException("The selected time is no longer available. Refresh availability and choose another time.");

        string accessToken = await GetGraphAccessTokenAsync();
        using HttpClient client = CreateClient(accessToken);
        var graphEvent = new
        {
            subject = $"Meet with a Coach: {huddleName}",
            body = new { contentType = "text", content = BuildBody(huddleExternalId, question) },
            start = new { dateTime = EnsureUtc(startUtc).ToString("yyyy-MM-ddTHH:mm:ss"), timeZone = "UTC" },
            end = new { dateTime = EnsureUtc(endUtc).ToString("yyyy-MM-ddTHH:mm:ss"), timeZone = "UTC" },
            attendees = new[] { new { emailAddress = new { address = coach.Email, name = coach.DisplayName }, type = "required" } },
            isOnlineMeeting = true,
            onlineMeetingProvider = "teamsForBusiness",
            transactionId = bookingRequestId.ToString("D")
        };
        using HttpResponseMessage response = await client.PostAsJsonAsync("me/events", graphEvent, cancellationToken);
        string json = await ReadGraphResponseAsync(response, cancellationToken);
        using JsonDocument document = JsonDocument.Parse(json);
        JsonElement root = document.RootElement;
        return new CoachBookingResponse(
            RequiredString(root, "id"), coach.ExternalId, coach.DisplayName, EnsureUtc(startUtc), EnsureUtc(endUtc),
            NestedString(root, "onlineMeeting", "joinUrl"), OptionalString(root, "webLink"));
    }

    private async Task<IReadOnlyDictionary<string, string>> GetScheduleViewsAsync(string[] schedules, DateTime startUtc, DateTime endUtc, CancellationToken cancellationToken)
    {
        string accessToken = await GetGraphAccessTokenAsync();
        using HttpClient client = CreateClient(accessToken);
        var request = new
        {
            schedules,
            startTime = new { dateTime = EnsureUtc(startUtc).ToString("yyyy-MM-ddTHH:mm:ss"), timeZone = "UTC" },
            endTime = new { dateTime = EnsureUtc(endUtc).ToString("yyyy-MM-ddTHH:mm:ss"), timeZone = "UTC" },
            availabilityViewInterval = AvailabilityIntervalMinutes
        };
        using HttpResponseMessage response = await client.PostAsJsonAsync("me/calendar/getSchedule", request, cancellationToken);
        string json = await ReadGraphResponseAsync(response, cancellationToken);
        using JsonDocument document = JsonDocument.Parse(json);
        return document.RootElement.GetProperty("value").EnumerateArray().ToDictionary(
            item => RequiredString(item, "scheduleId"), item => RequiredString(item, "availabilityView"), StringComparer.OrdinalIgnoreCase);
    }

    private List<CoachAvailabilitySlotResponse> CreateMutuallyAvailableSlots(CoachOptions coach, IReadOnlyDictionary<string, string> views, DateTime startUtc, DateTime endUtc, int durationMinutes)
    {
        TimeZoneInfo zone = ResolveTimeZone(coach.TimeZone);
        int units = (int)Math.Ceiling(durationMinutes / (double)AvailabilityIntervalMinutes);
        DateTime minimum = DateTime.UtcNow.AddHours(coach.MinimumNoticeHours);
        DateTime maximum = DateTime.UtcNow.AddDays(coach.MaximumAdvanceDays);
        DateTime windowStart = EnsureUtc(startUtc);
        List<CoachAvailabilitySlotResponse> result = [];
        for (int index = 0; windowStart.AddMinutes(index * AvailabilityIntervalMinutes + durationMinutes) <= EnsureUtc(endUtc); index++)
        {
            DateTime candidateStart = windowStart.AddMinutes(index * AvailabilityIntervalMinutes);
            DateTime candidateEnd = candidateStart.AddMinutes(durationMinutes);
            if (candidateStart < minimum || candidateStart > maximum || !InsideWorkingHours(coach, zone, candidateStart, candidateEnd)) continue;
            if (views.Values.All(view => index + units <= view.Length && view.AsSpan(index, units).ToString().All(value => value == '0')))
                result.Add(new CoachAvailabilitySlotResponse(candidateStart, candidateEnd));
        }
        return result;
    }

    private static bool InsideWorkingHours(CoachOptions coach, TimeZoneInfo zone, DateTime startUtc, DateTime endUtc)
    {
        DateTime start = TimeZoneInfo.ConvertTimeFromUtc(startUtc, zone);
        DateTime end = TimeZoneInfo.ConvertTimeFromUtc(endUtc, zone);
        return start.Date == end.Date && coach.WorkingDays.Contains(start.DayOfWeek.ToString(), StringComparer.OrdinalIgnoreCase)
            && TimeOnly.FromDateTime(start) >= coach.WorkDayStart && TimeOnly.FromDateTime(end) <= coach.WorkDayEnd;
    }

    private async Task<string> GetGraphAccessTokenAsync()
    {
        try { return await tokenAcquisition.GetAccessTokenForUserAsync(_options.GraphScopes); }
        catch (Exception) { throw new ExternalServiceUnavailableException("Microsoft Graph authorization is not configured for Coach scheduling."); }
    }

    private HttpClient CreateClient(string accessToken)
    {
        HttpClient client = httpClientFactory.CreateClient(HttpClientName);
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
        return client;
    }

    private static async Task<string> ReadGraphResponseAsync(HttpResponseMessage response, CancellationToken cancellationToken)
    {
        string content = await response.Content.ReadAsStringAsync(cancellationToken);
        if (!response.IsSuccessStatusCode)
            throw new ExternalServiceUnavailableException($"Microsoft Graph calendar request failed with status {(int)response.StatusCode}.");
        return content;
    }

    private CoachOptions FindCoach(string externalId)
    {
        EnsureDirectoryConfigured();
        return _options.Coaches.SingleOrDefault(x => x.Active && x.ExternalId.Equals(externalId, StringComparison.OrdinalIgnoreCase))
            ?? throw new NotFoundException($"Coach '{externalId}' was not found.");
    }

    private void EnsureDirectoryConfigured()
    {
        if (_options.Coaches.Count == 0) throw new ExternalServiceUnavailableException("The approved Coach directory has not been configured.");
        if (_options.Coaches.Any(x => string.IsNullOrWhiteSpace(x.ExternalId) || string.IsNullOrWhiteSpace(x.Email) || string.IsNullOrWhiteSpace(x.DisplayName)))
            throw new ExternalServiceUnavailableException("The Coach directory contains an incomplete entry.");
    }

    private static void ValidateWindow(DateTime startUtc, DateTime endUtc, int durationMinutes)
    {
        if (durationMinutes is not (30 or 60)) throw new ArgumentException("Duration must be 30 or 60 minutes.");
        if (EnsureUtc(endUtc) <= EnsureUtc(startUtc) || EnsureUtc(endUtc) - EnsureUtc(startUtc) > TimeSpan.FromDays(31)) throw new ArgumentException("The availability window is invalid.");
    }

    private static TimeZoneInfo ResolveTimeZone(string id)
    {
        try { return TimeZoneInfo.FindSystemTimeZoneById(id); }
        catch (TimeZoneNotFoundException) { throw new ExternalServiceUnavailableException($"Coach time zone '{id}' is not valid on this server."); }
    }

    private static CoachResponse ToResponse(CoachOptions value) => new(value.ExternalId, value.DisplayName, value.JobTitle, value.Biography, value.Expertise, value.TimeZone);
    private static DateTime EnsureUtc(DateTime value) => value.Kind == DateTimeKind.Utc ? value : value.ToUniversalTime();
    private static string BuildBody(string huddleExternalId, string? question) => string.IsNullOrWhiteSpace(question) ? $"Huddle: {huddleExternalId}" : $"Huddle: {huddleExternalId}\n\nQuestion or context:\n{question.Trim()}";
    private static string RequiredString(JsonElement element, string name) => element.GetProperty(name).GetString() ?? throw new ExternalServiceUnavailableException($"Microsoft Graph response omitted '{name}'.");
    private static string? OptionalString(JsonElement element, string name) => element.TryGetProperty(name, out JsonElement value) ? value.GetString() : null;
    private static string? NestedString(JsonElement element, string parent, string child) => element.TryGetProperty(parent, out JsonElement value) && value.ValueKind == JsonValueKind.Object ? OptionalString(value, child) : null;
}
