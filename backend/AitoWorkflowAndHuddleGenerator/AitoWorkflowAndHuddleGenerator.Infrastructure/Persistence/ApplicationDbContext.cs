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

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        ArgumentNullException.ThrowIfNull(modelBuilder);

        base.OnModelCreating(modelBuilder);

        modelBuilder.ApplyConfigurationsFromAssembly(
            typeof(ApplicationDbContext).Assembly);
    }
}