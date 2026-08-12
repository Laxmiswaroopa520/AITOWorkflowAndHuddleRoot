using AitoWorkflowAndHuddleGenerator.Application.Abstractions.Coaching;
using AitoWorkflowAndHuddleGenerator.Contracts.Huddles.Coaching;
using MediatR;

namespace AitoWorkflowAndHuddleGenerator.Application.Features.Huddles.Coaching.Queries.GetCoaches;

public sealed class GetCoachesQueryHandler(ICoachSchedulingService service) : IRequestHandler<GetCoachesQuery, IReadOnlyList<CoachResponse>>
{
    public Task<IReadOnlyList<CoachResponse>> Handle(GetCoachesQuery request, CancellationToken cancellationToken) =>
        service.GetCoachesAsync(request.HuddleExternalId, cancellationToken);
}
