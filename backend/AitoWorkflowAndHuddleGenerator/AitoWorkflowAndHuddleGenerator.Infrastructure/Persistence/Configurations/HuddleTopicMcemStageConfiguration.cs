using AitoWorkflowAndHuddleGenerator.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AitoWorkflowAndHuddleGenerator.Infrastructure.Persistence.Configurations;

public sealed class HuddleTopicMcemStageConfiguration : IEntityTypeConfiguration<HuddleTopicMcemStage>
{
    public void Configure(EntityTypeBuilder<HuddleTopicMcemStage> builder)
    {
        builder.ToTable("HuddleTopicMcemStages"); builder.HasKey(x => new { x.HuddleTopicId, x.HuddleMcemStageId }); builder.HasIndex(x => new { x.HuddleTopicId, x.DisplayOrder }).IsUnique(); builder.HasOne(x => x.HuddleTopic).WithMany(x => x.McemStages).HasForeignKey(x => x.HuddleTopicId).OnDelete(DeleteBehavior.Restrict); builder.HasOne(x => x.HuddleMcemStage).WithMany().HasForeignKey(x => x.HuddleMcemStageId).OnDelete(DeleteBehavior.Restrict);
    }
}

