/*This allows Application services to use the persistence abstraction without depending on Infrastructure.*/


//Defines the persistence abstraction used by the Application layer to access database tables.
using AitoWorkflowAndHuddleGenerator.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;

namespace AitoWorkflowAndHuddleGenerator
    .Application
    .Abstractions
    .Persistence;

/// <summary>
/// Defines the contract for IApplication Db Context.
/// </summary>
public interface IApplicationDbContext
{
    DbSet<Role> Roles { get; }

    DbSet<AiTool> AiTools { get; }

    DbSet<WorkflowBucket> WorkflowBuckets { get; }

    DbSet<Activity> Activities { get; }

    DbSet<ActivityAiTool> ActivityAiTools { get; }

    DbSet<UserWorkflow> UserWorkflows { get; }

    DbSet<UserWorkflowActivity> UserWorkflowActivities { get; }

    DbSet<WorkflowShare> WorkflowShares { get; }

    DbSet<HuddleSegment> HuddleSegments { get; }
    DbSet<HuddleSegmentRole> HuddleSegmentRoles { get; }
    DbSet<HuddleFocusArea> HuddleFocusAreas { get; }
    DbSet<HuddleMcemStage> HuddleMcemStages { get; }
    DbSet<HuddleTopic> HuddleTopics { get; }
    DbSet<HuddleTopicRole> HuddleTopicRoles { get; }
    DbSet<HuddleRolePathItem> HuddleRolePathItems { get; }
    DbSet<HuddleTopicMcemStage> HuddleTopicMcemStages { get; }
    DbSet<HuddlePhase> HuddlePhases { get; }
    DbSet<HuddleActivity> HuddleActivities { get; }
    DbSet<HuddleFacilitatorGuide> HuddleFacilitatorGuides { get; }
    DbSet<HuddleAgent> HuddleAgents { get; }
    DbSet<HuddleTopicAgent> HuddleTopicAgents { get; }
    DbSet<HuddleActivityAgent> HuddleActivityAgents { get; }
    DbSet<HuddleResource> HuddleResources { get; }
    DbSet<HuddleTopicResource> HuddleTopicResources { get; }
    DbSet<HuddleActivityResource> HuddleActivityResources { get; }
    DbSet<HuddleAgentResource> HuddleAgentResources { get; }
    DbSet<UserHuddlePlan> UserHuddlePlans { get; }
    DbSet<UserHuddlePlanItem> UserHuddlePlanItems { get; }
    DbSet<UserHuddleSession> UserHuddleSessions { get; }
    DbSet<UserHuddleActivityProgress> UserHuddleActivityProgress { get; }
    DbSet<HuddleVote> HuddleVotes { get; }

    Task<int> SaveChangesAsync(
        CancellationToken cancellationToken = default);
}
