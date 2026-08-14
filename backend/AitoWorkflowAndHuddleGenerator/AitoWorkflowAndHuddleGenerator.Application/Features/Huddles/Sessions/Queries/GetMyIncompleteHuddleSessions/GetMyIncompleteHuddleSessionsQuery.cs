using AitoWorkflowAndHuddleGenerator.Contracts.Huddles;
using MediatR;

namespace AitoWorkflowAndHuddleGenerator.Application.Features.Huddles.Sessions.Queries.GetMyIncompleteHuddleSessions;

/// <summary>
/// Represents the Get My Incomplete Huddle Sessions Query query.
/// </summary>
public sealed record GetMyIncompleteHuddleSessionsQuery : IRequest<IReadOnlyList<IncompleteHuddleSessionResponse>>;
