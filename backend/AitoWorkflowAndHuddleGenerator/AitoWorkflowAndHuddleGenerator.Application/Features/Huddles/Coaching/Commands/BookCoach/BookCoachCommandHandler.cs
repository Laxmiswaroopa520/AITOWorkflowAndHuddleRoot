using AitoWorkflowAndHuddleGenerator.Application.Abstractions.Coaching;
using AitoWorkflowAndHuddleGenerator.Application.Abstractions.Persistence;
using AitoWorkflowAndHuddleGenerator.Application.Common.Exceptions;
using AitoWorkflowAndHuddleGenerator.Contracts.Huddles.Coaching;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AitoWorkflowAndHuddleGenerator.Application.Features.Huddles.Coaching.Commands.BookCoach;

/// <summary>
/// Handles the Book Coach command.
/// </summary>
public sealed class BookCoachCommandHandler(ICoachSchedulingService service, IApplicationDbContext dbContext) : IRequestHandler<BookCoachCommand, CoachBookingResponse>
{
    /// <summary>
    /// Handles the request through the application pipeline.
    /// </summary>
    public async Task<CoachBookingResponse> Handle(BookCoachCommand command, CancellationToken cancellationToken)
    {
        BookCoachRequest request = command.Request;
        string? huddleName = await dbContext.HuddleTopics.AsNoTracking()
            .Where(x => x.ExternalId == request.HuddleExternalId && x.PublicationStatus == "Published")
            .Select(x => x.Name).SingleOrDefaultAsync(cancellationToken);
        if (huddleName is null && request.HuddleExternalId != "frontier-accelerator-orientation")
            throw new NotFoundException(HuddleMessages.PublishedNotFound(request.HuddleExternalId));
        return await service.BookAsync(request.CoachExternalId, request.HuddleExternalId, huddleName ?? "Frontier Accelerator Orientation", request.StartUtc, request.EndUtc, request.DisplayTimeZone, request.Question, request.BookingRequestId, cancellationToken);
    }
}
