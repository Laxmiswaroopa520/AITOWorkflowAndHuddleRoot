using AitoWorkflowAndHuddleGenerator.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AitoWorkflowAndHuddleGenerator.Infrastructure.Persistence.Configurations;

public sealed class HuddleFacilitatorGuideConfiguration : IEntityTypeConfiguration<HuddleFacilitatorGuide>
{
    public void Configure(EntityTypeBuilder<HuddleFacilitatorGuide> builder)
    {
        builder.ToTable("HuddleFacilitatorGuides"); builder.HasKey(x => x.Id); builder.Property(x => x.ExternalId).HasMaxLength(100).IsRequired(); builder.Property(x => x.CreatedAtUtc).IsRequired(); builder.HasIndex(x => x.ExternalId).IsUnique(); builder.HasIndex(x => x.HuddleTopicId).IsUnique(); builder.HasOne(x => x.HuddleTopic).WithOne(x => x.FacilitatorGuide).HasForeignKey<HuddleFacilitatorGuide>(x => x.HuddleTopicId).OnDelete(DeleteBehavior.Restrict);
    }
}

