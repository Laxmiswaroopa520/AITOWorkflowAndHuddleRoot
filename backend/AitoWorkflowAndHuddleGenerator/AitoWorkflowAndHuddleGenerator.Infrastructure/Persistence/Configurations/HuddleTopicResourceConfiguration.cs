using AitoWorkflowAndHuddleGenerator.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AitoWorkflowAndHuddleGenerator.Infrastructure.Persistence.Configurations;

public sealed class HuddleTopicResourceConfiguration : IEntityTypeConfiguration<HuddleTopicResource>
{
    public void Configure(EntityTypeBuilder<HuddleTopicResource> builder)
    {
        builder.ToTable("HuddleTopicResources"); builder.HasKey(x => new { x.HuddleTopicId, x.HuddleResourceId }); builder.HasIndex(x => new { x.HuddleTopicId, x.DisplayOrder }).IsUnique(); builder.HasOne(x => x.HuddleTopic).WithMany(x => x.TopicResources).HasForeignKey(x => x.HuddleTopicId).OnDelete(DeleteBehavior.Restrict); builder.HasOne(x => x.HuddleResource).WithMany().HasForeignKey(x => x.HuddleResourceId).OnDelete(DeleteBehavior.Restrict);
    }
}

