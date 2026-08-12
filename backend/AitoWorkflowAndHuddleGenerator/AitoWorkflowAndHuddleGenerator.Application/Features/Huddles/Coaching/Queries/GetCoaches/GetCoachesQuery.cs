using AitoWorkflowAndHuddleGenerator.Contracts.Huddles.Coaching;
using MediatR;

namespace AitoWorkflowAndHuddleGenerator.Application.Features.Huddles.Coaching.Queries.GetCoaches;

public sealed record GetCoachesQuery(string? HuddleExternalId) : IRequest<IReadOnlyList<CoachResponse>>;
