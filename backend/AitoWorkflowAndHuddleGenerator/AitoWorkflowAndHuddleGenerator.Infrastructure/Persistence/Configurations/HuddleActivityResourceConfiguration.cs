using AitoWorkflowAndHuddleGenerator.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AitoWorkflowAndHuddleGenerator.Infrastructure.Persistence.Configurations;

public sealed class HuddleActivityResourceConfiguration : IEntityTypeConfiguration<HuddleActivityResource>
{
    public void Configure(EntityTypeBuilder<HuddleActivityResource> builder)
    {
        builder.ToTable("HuddleActivityResources"); builder.HasKey(x => new { x.HuddleActivityId, x.HuddleResourceId }); builder.HasIndex(x => new { x.HuddleActivityId, x.DisplayOrder }).IsUnique(); builder.HasOne(x => x.HuddleActivity).WithMany(x => x.ActivityResources).HasForeignKey(x => x.HuddleActivityId).OnDelete(DeleteBehavior.Restrict); builder.HasOne(x => x.HuddleResource).WithMany().HasForeignKey(x => x.HuddleResourceId).OnDelete(DeleteBehavior.Restrict);
    }
}

