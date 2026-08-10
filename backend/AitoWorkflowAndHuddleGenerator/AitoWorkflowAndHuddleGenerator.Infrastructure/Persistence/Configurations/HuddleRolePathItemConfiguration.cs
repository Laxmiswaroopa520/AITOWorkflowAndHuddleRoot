using AitoWorkflowAndHuddleGenerator.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AitoWorkflowAndHuddleGenerator.Infrastructure.Persistence.Configurations;

public sealed class HuddleRolePathItemConfiguration : IEntityTypeConfiguration<HuddleRolePathItem>
{
    public void Configure(EntityTypeBuilder<HuddleRolePathItem> builder)
    {
        builder.ToTable("HuddleRolePathItems", t => t.HasCheckConstraint("CK_HuddleRolePathItems_WeekPosition", "[WeekPosition] > 0")); builder.HasKey(x => new { x.HuddleSegmentRoleId, x.WeekPosition }); builder.HasOne(x => x.HuddleSegmentRole).WithMany(x => x.PathItems).HasForeignKey(x => x.HuddleSegmentRoleId).OnDelete(DeleteBehavior.Restrict); builder.HasOne(x => x.HuddleTopic).WithMany().HasForeignKey(x => x.HuddleTopicId).OnDelete(DeleteBehavior.Restrict);
    }
}

