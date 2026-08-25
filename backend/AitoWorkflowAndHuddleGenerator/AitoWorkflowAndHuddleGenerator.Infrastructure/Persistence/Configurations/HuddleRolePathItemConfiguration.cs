using AitoWorkflowAndHuddleGenerator.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AitoWorkflowAndHuddleGenerator.Infrastructure.Persistence.Configurations;

/// <summary>
/// Configures EF Core persistence for the Huddle Role Path Item entity.
/// </summary>
public sealed class HuddleRolePathItemConfiguration : IEntityTypeConfiguration<HuddleRolePathItem>
{
    /// <summary>
    /// Configures the entity mapping and database constraints.
    /// </summary>
    public void Configure(EntityTypeBuilder<HuddleRolePathItem> builder)
    {
        builder.ToTable("HuddleRolePathItems", t => t.HasCheckConstraint("CK_HuddleRolePathItems_WeekPosition", "[WeekPosition] > 0")); builder.HasKey(x => new { x.HuddleSegmentRoleId, x.WeekPosition }); builder.HasOne(x => x.HuddleSegmentRole).WithMany(x => x.PathItems).HasForeignKey(x => x.HuddleSegmentRoleId).OnDelete(DeleteBehavior.Restrict); builder.HasOne(x => x.HuddleTopic).WithMany().HasForeignKey(x => x.HuddleTopicId).OnDelete(DeleteBehavior.Restrict);
    }
}

