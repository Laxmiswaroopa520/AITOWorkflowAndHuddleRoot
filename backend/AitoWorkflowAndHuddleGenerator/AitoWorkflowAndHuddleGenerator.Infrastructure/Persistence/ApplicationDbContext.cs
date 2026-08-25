/*Think of ApplicationDbContext as the gateway between your application and the database.*/
//Represents the EF Core database context and exposes all application tables through DbSet properties.
using AitoWorkflowAndHuddleGenerator
    .Application
    .Abstractions
    .Persistence;
using AitoWorkflowAndHuddleGenerator.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace AitoWorkflowAndHuddleGenerator
    .Infrastructure
    .Persistence;

/// <summary>
/// Represents the Application Db Context model.
/// </summary>
public sealed class ApplicationDbContext
    : DbContext,
      IApplicationDbContext
{
    public ApplicationDbContext(
        DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<Role> Roles => Set<Role>();

    public DbSet<AiTool> AiTools => Set<AiTool>();

    public DbSet<WorkflowBucket> WorkflowBuckets =>
        Set<WorkflowBucket>();

    public DbSet<Activity> Activities => Set<Activity>();

    public DbSet<ActivityAiTool> ActivityAiTools =>
        Set<ActivityAiTool>();

    public DbSet<UserWorkflow> UserWorkflows =>
        Set<UserWorkflow>();

    public DbSet<UserWorkflowActivity> UserWorkflowActivities =>
        Set<UserWorkflowActivity>();

    public DbSet<WorkflowShare> WorkflowShares =>
        Set<WorkflowShare>();

    public DbSet<HuddleSegment> HuddleSegments => Set<HuddleSegment>();
    public DbSet<HuddleSegmentRole> HuddleSegmentRoles => Set<HuddleSegmentRole>();
    public DbSet<HuddleFocusArea> HuddleFocusAreas => Set<HuddleFocusArea>();
    public DbSet<HuddleMcemStage> HuddleMcemStages => Set<HuddleMcemStage>();
    public DbSet<HuddleTopic> HuddleTopics => Set<HuddleTopic>();
    public DbSet<HuddleTopicRole> HuddleTopicRoles => Set<HuddleTopicRole>();
    public DbSet<HuddleRolePathItem> HuddleRolePathItems => Set<HuddleRolePathItem>();
    public DbSet<HuddlePlacement> HuddlePlacements => Set<HuddlePlacement>();
    public DbSet<HuddleTopicMcemStage> HuddleTopicMcemStages => Set<HuddleTopicMcemStage>();
    public DbSet<HuddlePhase> HuddlePhases => Set<HuddlePhase>();
    public DbSet<HuddleActivity> HuddleActivities => Set<HuddleActivity>();
    public DbSet<HuddleFacilitatorGuide> HuddleFacilitatorGuides => Set<HuddleFacilitatorGuide>();
    public DbSet<HuddleAgent> HuddleAgents => Set<HuddleAgent>();
    public DbSet<HuddleTopicAgent> HuddleTopicAgents => Set<HuddleTopicAgent>();
    public DbSet<HuddleActivityAgent> HuddleActivityAgents => Set<HuddleActivityAgent>();
    public DbSet<HuddleResource> HuddleResources => Set<HuddleResource>();
    public DbSet<HuddleTopicResource> HuddleTopicResources => Set<HuddleTopicResource>();
    public DbSet<HuddleActivityResource> HuddleActivityResources => Set<HuddleActivityResource>();
    public DbSet<HuddleAgentResource> HuddleAgentResources => Set<HuddleAgentResource>();
    public DbSet<UserHuddlePlan> UserHuddlePlans => Set<UserHuddlePlan>();
    public DbSet<UserHuddlePlanItem> UserHuddlePlanItems => Set<UserHuddlePlanItem>();
    public DbSet<UserHuddleSession> UserHuddleSessions => Set<UserHuddleSession>();
    public DbSet<UserHuddleActivityProgress> UserHuddleActivityProgress => Set<UserHuddleActivityProgress>();
      public DbSet<HuddleVote> HuddleVotes => Set<HuddleVote>();
      public DbSet<UserHuddleLaunchPlan> UserHuddleLaunchPlans => Set<UserHuddleLaunchPlan>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        ArgumentNullException.ThrowIfNull(modelBuilder);

        base.OnModelCreating(modelBuilder);

        modelBuilder.ApplyConfigurationsFromAssembly(
            typeof(ApplicationDbContext).Assembly);

    }
}
