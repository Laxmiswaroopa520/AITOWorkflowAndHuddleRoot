using AitoWorkflowAndHuddleGenerator.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AitoWorkflowAndHuddleGenerator.Infrastructure.Persistence.Configurations;

public sealed class HuddleTopicAgentConfiguration : IEntityTypeConfiguration<HuddleTopicAgent>
{
    public void Configure(EntityTypeBuilder<HuddleTopicAgent> builder)
    {
        builder.ToTable("HuddleTopicAgents"); builder.HasKey(x => new { x.HuddleTopicId, x.HuddleAgentId, x.UsageType }); builder.Property(x => x.UsageType).HasConversion<string>().HasMaxLength(20); builder.HasIndex(x => new { x.HuddleTopicId, x.DisplayOrder }).IsUnique(); builder.HasOne(x => x.HuddleTopic).WithMany(x => x.TopicAgents).HasForeignKey(x => x.HuddleTopicId).OnDelete(DeleteBehavior.Restrict); builder.HasOne(x => x.HuddleAgent).WithMany().HasForeignKey(x => x.HuddleAgentId).OnDelete(DeleteBehavior.Restrict);
    }
}

