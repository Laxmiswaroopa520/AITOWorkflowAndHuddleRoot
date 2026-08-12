using AitoWorkflowAndHuddleGenerator.Api.Authorization;
using AitoWorkflowAndHuddleGenerator.Api.Controllers;
using AitoWorkflowAndHuddleGenerator.Application.Abstractions.Identity;
using AitoWorkflowAndHuddleGenerator.Application.Common.Exceptions;
using AitoWorkflowAndHuddleGenerator.Application.Features.Huddles.Sessions.Commands.CompleteHuddleSession;
using AitoWorkflowAndHuddleGenerator.Application.Features.Huddles.Sessions.Commands.SaveHuddleSession;
using AitoWorkflowAndHuddleGenerator.Application.Features.Huddles.Sessions.Commands.SetHuddleActivityCompletion;
using AitoWorkflowAndHuddleGenerator.Application.Features.Huddles.Sessions.Queries.GetMyHuddleSession;
using AitoWorkflowAndHuddleGenerator.Application.Features.Huddles.Sessions.Queries.GetMyIncompleteHuddleSessions;
using AitoWorkflowAndHuddleGenerator.Contracts.Huddles;
using AitoWorkflowAndHuddleGenerator.Domain.Entities;
using AitoWorkflowAndHuddleGenerator.Domain.Enums;
using AitoWorkflowAndHuddleGenerator.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using System.Reflection;

namespace AitoWorkflowAndHuddleGenerator.IntegrationTests.Huddles;

public sealed class HuddleSessionApiTests
{
    [Fact]
    public void Controller_ShouldRequireAccessAsUserPolicy()
    {
        AuthorizeAttribute attribute = Assert.Single(typeof(HuddleSessionsController).GetCustomAttributes<AuthorizeAttribute>());
        Assert.Equal(Policies.AccessAsUser, attribute.Policy);
    }

    [Fact]
    public async Task SaveSession_ShouldCreateAuthenticatedOwnedProgress()
    {
        await using ApplicationDbContext db = CreateContext();
        HuddleTopic topic = await SeedCatalog(db);
        HuddleSessionResponse response = await new SaveHuddleSessionCommandHandler(db, new TestCurrentUserService("user-1"))
            .Handle(new SaveHuddleSessionCommand(topic.ExternalId, "phase-1", "Private notes", null), default);

        UserHuddleSession saved = await db.UserHuddleSessions.SingleAsync();
        Assert.Equal("user-1", saved.OwnerObjectId);
        Assert.Equal("Private notes", response.FacilitatorNotes);
        Assert.Equal("phase-1", response.CurrentPhaseExternalId);
        Assert.Equal(HuddleSessionStatus.InProgress, saved.SessionStatus);
        Assert.True(saved.StartedAtUtc <= saved.LastSavedAtUtc);
    }

    [Fact]
    public async Task SessionQuery_ShouldNeverReturnAnotherUsersSession()
    {
        await using ApplicationDbContext db = CreateContext();
        HuddleTopic topic = await SeedCatalog(db);
        await new SaveHuddleSessionCommandHandler(db, new TestCurrentUserService("user-1"))
            .Handle(new SaveHuddleSessionCommand(topic.ExternalId, null, null, null), default);

        HuddleSessionResponse? response = await new GetMyHuddleSessionQueryHandler(db, new TestCurrentUserService("user-2"))
            .Handle(new GetMyHuddleSessionQuery(topic.ExternalId), default);
        Assert.Null(response);
    }

    [Fact]
    public async Task ActivityCompletion_ShouldRejectActivityFromAnotherHuddle()
    {
        await using ApplicationDbContext db = CreateContext();
        HuddleTopic topic = await SeedCatalog(db);
        UserHuddleSession session = CreateSession(topic, "user-1");
        HuddleTopic otherTopic = new() { ExternalId = "topic-2", Name = "Other", Type = "Prescriptive", PublicationStatus = "Published" };
        HuddlePhase otherPhase = new() { ExternalId = "phase-2", Name = "Other phase", HuddleTopic = otherTopic };
        db.UserHuddleSessions.Add(session);
        db.HuddleActivities.Add(new HuddleActivity { ExternalId = "other-activity", Name = "Other", HuddleTopic = otherTopic, HuddlePhase = otherPhase });
        await db.SaveChangesAsync();

        await Assert.ThrowsAsync<NotFoundException>(() => new SetHuddleActivityCompletionCommandHandler(db, new TestCurrentUserService("user-1"))
            .Handle(new SetHuddleActivityCompletionCommand(topic.ExternalId, "other-activity", true, Convert.ToBase64String(session.RowVersion)), default));
    }

    [Fact]
    public async Task IncompleteSessions_ShouldPreserveValidProgressReportRemovedAndLeaveNewActivitiesIncomplete()
    {
        await using ApplicationDbContext db = CreateContext();
        HuddleTopic topic = await SeedCatalog(db);
        UserHuddleSession session = CreateSession(topic, "user-1");
        HuddleActivity valid = topic.Phases.Single().Activities.First();
        HuddleTopic oldTopic = new() { ExternalId = "old-topic", Name = "Old", Type = "Prescriptive", PublicationStatus = "Published" };
        HuddlePhase oldPhase = new() { ExternalId = "old-phase", Name = "Old phase", HuddleTopic = oldTopic };
        HuddleActivity removed = new() { ExternalId = "removed-activity", Name = "Removed", HuddleTopic = oldTopic, HuddlePhase = oldPhase };
        session.ActivityProgress.Add(new UserHuddleActivityProgress { HuddleActivity = valid, IsCompleted = true, CompletedAtUtc = DateTimeOffset.UtcNow });
        session.ActivityProgress.Add(new UserHuddleActivityProgress { HuddleActivity = removed, IsCompleted = true, CompletedAtUtc = DateTimeOffset.UtcNow });
        db.UserHuddleSessions.Add(session);
        await db.SaveChangesAsync();

        IReadOnlyList<IncompleteHuddleSessionResponse> results = await new GetMyIncompleteHuddleSessionsQueryHandler(db, new TestCurrentUserService("user-1"))
            .Handle(new GetMyIncompleteHuddleSessionsQuery(), default);
        IncompleteHuddleSessionResponse result = Assert.Single(results);
        Assert.Equal(2, result.Session.ValidActivityCount);
        Assert.Equal(1, result.Session.CompletedActivityCount);
        Assert.Contains("removed-activity", result.Session.RemovedActivityExternalIds);
        Assert.True(result.Session.CanContinue);
    }

    [Fact]
    public async Task CompleteSession_ShouldRequireEveryCurrentActivity()
    {
        await using ApplicationDbContext db = CreateContext();
        HuddleTopic topic = await SeedCatalog(db);
        UserHuddleSession session = CreateSession(topic, "user-1");
        session.ActivityProgress.Add(new UserHuddleActivityProgress { HuddleActivity = topic.Phases.Single().Activities.First(), IsCompleted = true });
        db.UserHuddleSessions.Add(session);
        await db.SaveChangesAsync();

        await Assert.ThrowsAsync<ConflictException>(() => new CompleteHuddleSessionCommandHandler(db, new TestCurrentUserService("user-1"))
            .Handle(new CompleteHuddleSessionCommand(topic.ExternalId, Convert.ToBase64String(session.RowVersion)), default));
    }

    private static async Task<HuddleTopic> SeedCatalog(ApplicationDbContext db)
    {
        HuddleTopic topic = new() { ExternalId = "topic-1", Name = "Topic", Type = "Prescriptive", PublicationStatus = "Published" };
        HuddlePhase phase = new() { ExternalId = "phase-1", Name = "Phase", HuddleTopic = topic };
        topic.Phases.Add(phase);
        phase.Activities.Add(new HuddleActivity { ExternalId = "activity-1", Name = "One", HuddleTopic = topic, HuddlePhase = phase, DisplayOrder = 1 });
        phase.Activities.Add(new HuddleActivity { ExternalId = "activity-2", Name = "Two", HuddleTopic = topic, HuddlePhase = phase, DisplayOrder = 2 });
        db.HuddleTopics.Add(topic);
        await db.SaveChangesAsync();
        return topic;
    }

    private static UserHuddleSession CreateSession(HuddleTopic topic, string owner) => new()
    {
        Id = Guid.NewGuid(), OwnerObjectId = owner, HuddleTopic = topic,
        StartedAtUtc = DateTimeOffset.UtcNow, LastSavedAtUtc = DateTimeOffset.UtcNow,
        CreatedAtUtc = DateTimeOffset.UtcNow, SessionStatus = HuddleSessionStatus.InProgress,
        RowVersion = [1]
    };

    private static ApplicationDbContext CreateContext() => new(new DbContextOptionsBuilder<ApplicationDbContext>()
        .UseInMemoryDatabase(Guid.NewGuid().ToString()).Options);

    private sealed class TestCurrentUserService(string objectId) : ICurrentUserService
    {
        public bool IsAuthenticated => true;
        public string? ObjectId => objectId;
        public string? Email => "test@example.com";
        public string? DisplayName => "Test User";
        public IReadOnlyCollection<string> Roles => [];
    }
}
