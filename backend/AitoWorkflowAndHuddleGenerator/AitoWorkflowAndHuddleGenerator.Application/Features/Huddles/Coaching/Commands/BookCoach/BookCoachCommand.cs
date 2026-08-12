using AitoWorkflowAndHuddleGenerator.Contracts.Huddles.Coaching;
using MediatR;

namespace AitoWorkflowAndHuddleGenerator.Application.Features.Huddles.Coaching.Commands.BookCoach;

public sealed record BookCoachCommand(BookCoachRequest Request) : IRequest<CoachBookingResponse>;
