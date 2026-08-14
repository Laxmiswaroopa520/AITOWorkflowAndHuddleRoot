using AitoWorkflowAndHuddleGenerator.Contracts.Huddles.Coaching;

namespace AitoWorkflowAndHuddleGenerator.Application.Abstractions.Coaching;

/// <summary>
/// Provides ICoach Scheduling operations.
/// </summary>
public interface ICoachSchedulingService
{
    Task<IReadOnlyList<CoachResponse>> GetCoachesAsync(string? huddleExternalId, CancellationToken cancellationToken);
    Task<CoachAvailabilityResponse> GetAvailabilityAsync(string coachExternalId, DateTime startUtc, DateTime endUtc, int durationMinutes, CancellationToken cancellationToken);
    Task<CoachBookingResponse> BookAsync(string coachExternalId, string huddleExternalId, string huddleName, DateTime startUtc, DateTime endUtc, string displayTimeZone, string? question, Guid bookingRequestId, CancellationToken cancellationToken);
}
