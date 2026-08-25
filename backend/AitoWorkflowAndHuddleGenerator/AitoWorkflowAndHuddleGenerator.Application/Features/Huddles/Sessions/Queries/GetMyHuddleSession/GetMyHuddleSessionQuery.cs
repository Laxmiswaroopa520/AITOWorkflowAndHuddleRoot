using AitoWorkflowAndHuddleGenerator.Contracts.Huddles;
using MediatR;

namespace AitoWorkflowAndHuddleGenerator.Application.Features.Huddles.Sessions.Queries.GetMyHuddleSession;

/// <summary>
/// Represents the Get My Huddle Session Query query.
/// </summary>
public sealed record GetMyHuddleSessionQuery(
    string HuddleExternalId,
    /// <summary>Scopes the tracked activity set to one placement. Null keeps the topic-wide set.</summary>
    string? PlacementExternalId = null) : IRequest<HuddleSessionResponse?>;
