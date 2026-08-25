using AitoWorkflowAndHuddleGenerator.Contracts.Huddles;
using MediatR;

namespace AitoWorkflowAndHuddleGenerator.Application.Features.Huddles.Sessions.Commands.SaveHuddleSession;

/// <summary>
/// Represents the Save Huddle Session Command command.
/// </summary>
public sealed record SaveHuddleSessionCommand(
    string HuddleExternalId,
    string? CurrentPhaseExternalId,
    string? FacilitatorNotes,
    string? RowVersion,
    string? PlacementExternalId = null) : IRequest<HuddleSessionResponse>;
