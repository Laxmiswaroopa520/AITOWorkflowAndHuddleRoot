using AitoWorkflowAndHuddleGenerator.Contracts.Huddles;
using MediatR;

namespace AitoWorkflowAndHuddleGenerator.Application.Features.Huddles.Sessions.Commands.SaveHuddleSession;

public sealed record SaveHuddleSessionCommand(
    string HuddleExternalId,
    string? CurrentPhaseExternalId,
    string? FacilitatorNotes,
    string? RowVersion) : IRequest<HuddleSessionResponse>;
