using AitoWorkflowAndHuddleGenerator.Contracts.Huddles;
using MediatR;

namespace AitoWorkflowAndHuddleGenerator.Application.Features.Huddles.Sessions.Queries.GetMyHuddleSession;

/// <summary>
/// Represents the Get My Huddle Session Query query.
/// </summary>
public sealed record GetMyHuddleSessionQuery(string HuddleExternalId) : IRequest<HuddleSessionResponse?>;
