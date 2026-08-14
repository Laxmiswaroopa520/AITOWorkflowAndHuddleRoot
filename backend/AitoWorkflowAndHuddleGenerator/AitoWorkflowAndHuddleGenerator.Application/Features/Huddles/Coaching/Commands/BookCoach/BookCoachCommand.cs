using AitoWorkflowAndHuddleGenerator.Contracts.Huddles.Coaching;
using MediatR;

namespace AitoWorkflowAndHuddleGenerator.Application.Features.Huddles.Coaching.Commands.BookCoach;

/// <summary>
/// Represents the Book Coach Command command.
/// </summary>
public sealed record BookCoachCommand(BookCoachRequest Request) : IRequest<CoachBookingResponse>;
