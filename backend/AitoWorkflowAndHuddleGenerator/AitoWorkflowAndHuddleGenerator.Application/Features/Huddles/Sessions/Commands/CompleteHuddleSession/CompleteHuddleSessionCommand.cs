using AitoWorkflowAndHuddleGenerator.Contracts.Huddles;
using MediatR;

namespace AitoWorkflowAndHuddleGenerator.Application.Features.Huddles.Sessions.Commands.CompleteHuddleSession;

/// <summary>
/// Represents the Complete Huddle Session Command command.
/// </summary>
public sealed record CompleteHuddleSessionCommand(string HuddleExternalId, string RowVersion) : IRequest<HuddleSessionResponse>;
