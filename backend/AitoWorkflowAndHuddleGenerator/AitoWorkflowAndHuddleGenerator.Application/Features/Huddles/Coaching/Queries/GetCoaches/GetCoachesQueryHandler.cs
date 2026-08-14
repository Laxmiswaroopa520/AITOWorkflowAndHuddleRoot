using AitoWorkflowAndHuddleGenerator.Application.Abstractions.Coaching;
using AitoWorkflowAndHuddleGenerator.Contracts.Huddles.Coaching;
using MediatR;

namespace AitoWorkflowAndHuddleGenerator.Application.Features.Huddles.Coaching.Queries.GetCoaches;

/// <summary>
/// Handles the Get Coaches query.
/// </summary>
public sealed class GetCoachesQueryHandler(ICoachSchedulingService service) : IRequestHandler<GetCoachesQuery, IReadOnlyList<CoachResponse>>
{
    /// <summary>
    /// Handles the request through the application pipeline.
    /// </summary>
    public Task<IReadOnlyList<CoachResponse>> Handle(GetCoachesQuery request, CancellationToken cancellationToken) =>
        service.GetCoachesAsync(request.HuddleExternalId, cancellationToken);
}
