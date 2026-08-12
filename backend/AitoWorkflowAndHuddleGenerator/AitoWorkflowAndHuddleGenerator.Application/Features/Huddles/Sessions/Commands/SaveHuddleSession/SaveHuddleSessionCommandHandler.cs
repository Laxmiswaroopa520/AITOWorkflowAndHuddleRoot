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

public sealed class SaveHuddleSessionCommandHandler(IApplicationDbContext dbContext, ICurrentUserService currentUserService)
    : IRequestHandler<SaveHuddleSessionCommand, HuddleSessionResponse>
{
    public async Task<HuddleSessionResponse> Handle(SaveHuddleSessionCommand request, CancellationToken cancellationToken)
    {
        string ownerObjectId = currentUserService.ObjectId
            ?? throw new UnauthorizedAccessException("The authenticated token does not contain an oid claim.");
        string externalId = request.HuddleExternalId.Trim();
        HuddleTopic topic = await dbContext.HuddleTopics
            .SingleOrDefaultAsync(item => item.ExternalId == externalId && item.PublicationStatus == "Published", cancellationToken)
            ?? throw new NotFoundException($"Published Huddle '{externalId}' was not found.");
        HuddlePhase? phase = null;
        if (!string.IsNullOrWhiteSpace(request.CurrentPhaseExternalId))
            phase = await dbContext.HuddlePhases.SingleOrDefaultAsync(item =>
                item.ExternalId == request.CurrentPhaseExternalId.Trim() && item.HuddleTopicId == topic.Id, cancellationToken)
                ?? throw new NotFoundException("The selected phase does not belong to this Huddle.");
        UserHuddleSession? session = await dbContext.UserHuddleSessions
            .Include(item => item.ActivityProgress).ThenInclude(item => item.HuddleActivity)
            .Include(item => item.HuddleTopic)
            .Include(item => item.CurrentHuddlePhase)
            .SingleOrDefaultAsync(item => item.OwnerObjectId == ownerObjectId && item.HuddleTopicId == topic.Id, cancellationToken);
        DateTimeOffset now = DateTimeOffset.UtcNow;
        if (session is null)
        {
            if (!string.IsNullOrWhiteSpace(request.RowVersion)) throw new ConflictException("The Huddle session no longer exists. Refresh and try again.");
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
            if (session.SessionStatus == HuddleSessionStatus.Completed) throw new ConflictException("This Huddle session is already complete.");
            ApplyConcurrency(session, request.RowVersion);
            session.CurrentHuddlePhase = phase;
            session.Notes = request.FacilitatorNotes;
            session.LastSavedAtUtc = now;
            session.UpdatedAtUtc = now;
        }
        await Save(cancellationToken);
        session.HuddleTopic = topic;
        session.CurrentHuddlePhase = phase;
        List<HuddleActivity> validActivities = await dbContext.HuddleActivities.AsNoTracking()
            .Where(activity => activity.HuddleTopicId == topic.Id).ToListAsync(cancellationToken);
        return HuddleSessionMappings.ToResponse(session, validActivities);
    }

    private void ApplyConcurrency(UserHuddleSession session, string? rowVersion)
    {
        if (string.IsNullOrWhiteSpace(rowVersion)) throw new ConflictException("The Huddle session changed. Refresh and try again.");
        dbContext.UserHuddleSessions.Entry(session).Property(item => item.RowVersion).OriginalValue = Convert.FromBase64String(rowVersion);
    }

    private async Task Save(CancellationToken cancellationToken)
    {
        try { await dbContext.SaveChangesAsync(cancellationToken); }
        catch (DbUpdateConcurrencyException) { throw new ConflictException("This Huddle session was changed by another request. Refresh and try again."); }
        catch (DbUpdateException) { throw new ConflictException("A Huddle session already exists for this user and topic. Refresh and try again."); }
    }
}
