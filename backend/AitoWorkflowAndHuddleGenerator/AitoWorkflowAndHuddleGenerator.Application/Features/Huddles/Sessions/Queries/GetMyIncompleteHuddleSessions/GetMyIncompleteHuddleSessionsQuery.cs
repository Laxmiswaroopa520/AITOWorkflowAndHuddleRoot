using AitoWorkflowAndHuddleGenerator.Contracts.Huddles;
using MediatR;

namespace AitoWorkflowAndHuddleGenerator.Application.Features.Huddles.Sessions.Queries.GetMyIncompleteHuddleSessions;

public sealed record GetMyIncompleteHuddleSessionsQuery : IRequest<IReadOnlyList<IncompleteHuddleSessionResponse>>;
