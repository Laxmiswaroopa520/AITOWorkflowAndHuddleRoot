using AitoWorkflowAndHuddleGenerator.Contracts.Huddles;
using MediatR;

namespace AitoWorkflowAndHuddleGenerator.Application.Features.Huddles.Sessions.Commands.CompleteHuddleSession;

public sealed record CompleteHuddleSessionCommand(string HuddleExternalId, string RowVersion) : IRequest<HuddleSessionResponse>;
