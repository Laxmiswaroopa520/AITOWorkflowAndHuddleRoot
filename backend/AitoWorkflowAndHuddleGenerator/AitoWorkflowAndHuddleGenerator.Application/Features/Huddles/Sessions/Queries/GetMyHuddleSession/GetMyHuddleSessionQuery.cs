using AitoWorkflowAndHuddleGenerator.Contracts.Huddles;
using MediatR;

namespace AitoWorkflowAndHuddleGenerator.Application.Features.Huddles.Sessions.Queries.GetMyHuddleSession;

public sealed record GetMyHuddleSessionQuery(string HuddleExternalId) : IRequest<HuddleSessionResponse?>;
