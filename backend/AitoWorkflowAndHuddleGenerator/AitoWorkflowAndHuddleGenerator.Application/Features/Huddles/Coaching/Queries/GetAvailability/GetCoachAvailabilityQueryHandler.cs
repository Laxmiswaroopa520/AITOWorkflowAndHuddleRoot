using AitoWorkflowAndHuddleGenerator.Application.Abstractions.Coaching;
using AitoWorkflowAndHuddleGenerator.Contracts.Huddles.Coaching;
using MediatR;

namespace AitoWorkflowAndHuddleGenerator.Application.Features.Huddles.Coaching.Queries.GetAvailability;

public sealed class GetCoachAvailabilityQueryHandler(ICoachSchedulingService service) : IRequestHandler<GetCoachAvailabilityQuery, CoachAvailabilityResponse>
{
    public Task<CoachAvailabilityResponse> Handle(GetCoachAvailabilityQuery request, CancellationToken cancellationToken) =>
        service.GetAvailabilityAsync(request.CoachExternalId, request.StartUtc, request.EndUtc, request.DurationMinutes, cancellationToken);
}
