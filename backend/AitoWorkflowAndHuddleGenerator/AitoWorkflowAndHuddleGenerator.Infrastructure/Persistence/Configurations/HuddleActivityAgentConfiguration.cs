using AitoWorkflowAndHuddleGenerator.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AitoWorkflowAndHuddleGenerator.Infrastructure.Persistence.Configurations;

public sealed class HuddleActivityAgentConfiguration : IEntityTypeConfiguration<HuddleActivityAgent>
{
    public void Configure(EntityTypeBuilder<HuddleActivityAgent> builder)
    {
        builder.ToTable("HuddleActivityAgents"); builder.HasKey(x => new { x.HuddleActivityId, x.HuddleAgentId, x.UsageType }); builder.Property(x => x.UsageType).HasConversion<string>().HasMaxLength(20); builder.HasIndex(x => new { x.HuddleActivityId, x.DisplayOrder }).IsUnique(); builder.HasOne(x => x.HuddleActivity).WithMany(x => x.ActivityAgents).HasForeignKey(x => x.HuddleActivityId).OnDelete(DeleteBehavior.Restrict); builder.HasOne(x => x.HuddleAgent).WithMany().HasForeignKey(x => x.HuddleAgentId).OnDelete(DeleteBehavior.Restrict);
    }
}

