using AitoWorkflowAndHuddleGenerator.Application.Abstractions.Identity;
using AitoWorkflowAndHuddleGenerator.Application.Abstractions.Persistence;
using AitoWorkflowAndHuddleGenerator.Application.Common.Exceptions;
using AitoWorkflowAndHuddleGenerator.Application.Features.Huddles.Sessions.Common;
using AitoWorkflowAndHuddleGenerator.Contracts.Huddles;
using AitoWorkflowAndHuddleGenerator.Domain.Entities;
using AitoWorkflowAndHuddleGenerator.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AitoWorkflowAndHuddleGenerator.Application.Features.Huddles.Sessions.Commands.SaveHuddleSession;

/// <summary>
/// Handles the Save Huddle Session command.
/// </summary>
public sealed class SaveHuddleSessionCommandHandler(IApplicationDbContext dbContext, ICurrentUserService currentUserService)
    : IRequestHandler<SaveHuddleSessionCommand, HuddleSessionResponse>
{
    /// <summary>
    /// Handles the request through the application pipeline.
    /// </summary>
    public async Task<HuddleSessionResponse> Handle(SaveHuddleSessionCommand request, CancellationToken cancellationToken)
    {
        string ownerObjectId = currentUserService.ObjectId
            ?? throw new UnauthorizedAccessException(AuthenticationMessages.MissingObjectIdClaim);
        string externalId = request.HuddleExternalId.Trim();
        HuddleTopic topic = await dbContext.HuddleTopics
            .SingleOrDefaultAsync(item => item.ExternalId == externalId && item.PublicationStatus == "Published", cancellationToken)
            ?? throw new NotFoundException(HuddleMessages.PublishedNotFound(externalId));
        HuddlePhase? phase = null;
        if (!string.IsNullOrWhiteSpace(request.CurrentPhaseExternalId))
            phase = await dbContext.HuddlePhases.SingleOrDefaultAsync(item =>
                item.ExternalId == request.CurrentPhaseExternalId.Trim() && item.HuddleTopicId == topic.Id, cancellationToken)
                ?? throw new NotFoundException(HuddleMessages.PhaseDoesNotBelong);
        UserHuddleSession? session = await dbContext.UserHuddleSessions
            .Include(item => item.ActivityProgress).ThenInclude(item => item.HuddleActivity)
            .Include(item => item.HuddleTopic)
            .Include(item => item.CurrentHuddlePhase)
            .SingleOrDefaultAsync(item => item.OwnerObjectId == ownerObjectId && item.HuddleTopicId == topic.Id, cancellationToken);
        DateTimeOffset now = DateTimeOffset.UtcNow;
        if (session is null)
        {
            if (!string.IsNullOrWhiteSpace(request.RowVersion)) throw new ConflictException(HuddleMessages.SessionNoLongerExists);
            session = new UserHuddleSession
            {
                Id = Guid.NewGuid(), OwnerObjectId = ownerObjectId, HuddleTopic = topic,
                CurrentHuddlePhase = phase, Notes = request.FacilitatorNotes,
                StartedAtUtc = now, LastSavedAtUtc = now, SessionStatus = HuddleSessionStatus.InProgress,
                CreatedAtUtc = now
            };
            dbContext.UserHuddleSessions.Add(session);
        }
        else
        {
            // A completed session stays completed: SessionStatus and CompletedAtUtc are
            // deliberately untouched below. Facilitator notes feed the HTML and PowerPoint
            // exports, so they must remain saveable after the session is finished. This also
            // matches SetHuddleActivityCompletion, which already edits completed sessions.
            ApplyConcurrency(session, request.RowVersion);
            session.CurrentHuddlePhase = phase;
            session.Notes = request.FacilitatorNotes;
            session.LastSavedAtUtc = now;
            session.UpdatedAtUtc = now;
        }
        await Save(cancellationToken);
        session.HuddleTopic = topic;
        session.CurrentHuddlePhase = phase;
        List<HuddleActivity> validActivities = await HuddleSessionActivityScope.LoadCompletableAsync(
            dbContext, topic.Id, externalId, request.PlacementExternalId, cancellationToken);
        return HuddleSessionMappings.ToResponse(session, validActivities);
    }

    private void ApplyConcurrency(UserHuddleSession session, string? rowVersion)
    {
        if (string.IsNullOrWhiteSpace(rowVersion)) throw new ConflictException(HuddleMessages.SessionChanged);
        dbContext.UserHuddleSessions.Entry(session).Property(item => item.RowVersion).OriginalValue = Convert.FromBase64String(rowVersion);
    }

    private async Task Save(CancellationToken cancellationToken)
    {
        try { await dbContext.SaveChangesAsync(cancellationToken); }
        catch (DbUpdateConcurrencyException) { throw new ConflictException(HuddleMessages.SessionChangedByAnotherRequest); }
        catch (DbUpdateException) { throw new ConflictException(HuddleMessages.SessionAlreadyExists); }
    }
}
