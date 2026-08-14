using AitoWorkflowAndHuddleGenerator.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AitoWorkflowAndHuddleGenerator.Infrastructure.Persistence.Configurations;

/// <summary>
/// Configures EF Core persistence for the Huddle Topic Mcem Stage entity.
/// </summary>
public sealed class HuddleTopicMcemStageConfiguration : IEntityTypeConfiguration<HuddleTopicMcemStage>
{
    /// <summary>
    /// Configures the entity mapping and database constraints.
    /// </summary>
    public void Configure(EntityTypeBuilder<HuddleTopicMcemStage> builder)
    {
        builder.ToTable("HuddleTopicMcemStages"); builder.HasKey(x => new { x.HuddleTopicId, x.HuddleMcemStageId }); builder.HasIndex(x => new { x.HuddleTopicId, x.DisplayOrder }).IsUnique(); builder.HasOne(x => x.HuddleTopic).WithMany(x => x.McemStages).HasForeignKey(x => x.HuddleTopicId).OnDelete(DeleteBehavior.Restrict); builder.HasOne(x => x.HuddleMcemStage).WithMany().HasForeignKey(x => x.HuddleMcemStageId).OnDelete(DeleteBehavior.Restrict);
    }
}

