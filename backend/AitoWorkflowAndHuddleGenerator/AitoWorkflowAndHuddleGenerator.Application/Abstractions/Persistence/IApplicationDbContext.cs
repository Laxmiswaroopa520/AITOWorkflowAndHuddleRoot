/*This allows Application services to use the persistence abstraction without depending on Infrastructure.*/


//Defines the persistence abstraction used by the Application layer to access database tables.
using AitoWorkflowAndHuddleGenerator.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;

namespace AitoWorkflowAndHuddleGenerator
    .Application
    .Abstractions
    .Persistence;

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

    Task<int> SaveChangesAsync(
        CancellationToken cancellationToken = default);
}