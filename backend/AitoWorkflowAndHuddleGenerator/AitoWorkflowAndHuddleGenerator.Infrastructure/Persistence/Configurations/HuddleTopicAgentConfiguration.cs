using AitoWorkflowAndHuddleGenerator.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AitoWorkflowAndHuddleGenerator.Infrastructure.Persistence.Configurations;

/// <summary>
/// Configures EF Core persistence for the Huddle Topic Agent entity.
/// </summary>
public sealed class HuddleTopicAgentConfiguration : IEntityTypeConfiguration<HuddleTopicAgent>
{
    /// <summary>
    /// Configures the entity mapping and database constraints.
    /// </summary>
    public void Configure(EntityTypeBuilder<HuddleTopicAgent> builder)
    {
        builder.ToTable("HuddleTopicAgents"); builder.HasKey(x => new { x.HuddleTopicId, x.HuddleAgentId, x.UsageType }); builder.Property(x => x.UsageType).HasConversion<string>().HasMaxLength(20); builder.HasIndex(x => new { x.HuddleTopicId, x.DisplayOrder }).IsUnique(); builder.HasOne(x => x.HuddleTopic).WithMany(x => x.TopicAgents).HasForeignKey(x => x.HuddleTopicId).OnDelete(DeleteBehavior.Restrict); builder.HasOne(x => x.HuddleAgent).WithMany().HasForeignKey(x => x.HuddleAgentId).OnDelete(DeleteBehavior.Restrict);
    }
}

