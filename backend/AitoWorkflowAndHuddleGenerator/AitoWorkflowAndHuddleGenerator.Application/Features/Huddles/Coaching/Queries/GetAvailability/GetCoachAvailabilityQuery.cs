using AitoWorkflowAndHuddleGenerator.Contracts.Huddles.Coaching;
using MediatR;

namespace AitoWorkflowAndHuddleGenerator.Application.Features.Huddles.Coaching.Queries.GetAvailability;

/// <summary>
/// Represents the Get Coach Availability Query query.
/// </summary>
public sealed record GetCoachAvailabilityQuery(string CoachExternalId, DateTime StartUtc, DateTime EndUtc, int DurationMinutes) : IRequest<CoachAvailabilityResponse>;
