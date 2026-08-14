using AitoWorkflowAndHuddleGenerator.Contracts.Huddles.Coaching;
using MediatR;

namespace AitoWorkflowAndHuddleGenerator.Application.Features.Huddles.Coaching.Queries.GetCoaches;

/// <summary>
/// Represents the Get Coaches Query query.
/// </summary>
public sealed record GetCoachesQuery(string? HuddleExternalId) : IRequest<IReadOnlyList<CoachResponse>>;
