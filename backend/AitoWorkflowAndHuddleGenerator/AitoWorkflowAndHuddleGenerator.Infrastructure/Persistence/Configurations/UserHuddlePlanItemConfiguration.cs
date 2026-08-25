using AitoWorkflowAndHuddleGenerator.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AitoWorkflowAndHuddleGenerator.Infrastructure.Persistence.Configurations;

/// <summary>
/// Configures EF Core persistence for the User Huddle Plan Item entity.
/// </summary>
public sealed class UserHuddlePlanItemConfiguration : IEntityTypeConfiguration<UserHuddlePlanItem>
{
    /// <summary>
    /// Configures the entity mapping and database constraints.
    /// </summary>
    public void Configure(EntityTypeBuilder<UserHuddlePlanItem> builder)
    {
        builder.ToTable("UserHuddlePlanItems", t => t.HasCheckConstraint("CK_UserHuddlePlanItems_WeekPosition", "[WeekPosition] > 0")); builder.HasKey(x => new { x.UserHuddlePlanId, x.WeekPosition }); builder.HasOne(x => x.UserHuddlePlan).WithMany(x => x.Items).HasForeignKey(x => x.UserHuddlePlanId).OnDelete(DeleteBehavior.Cascade); builder.HasOne(x => x.HuddleTopic).WithMany().HasForeignKey(x => x.HuddleTopicId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(x => x.HuddlePlacement).WithMany().HasForeignKey(x => x.HuddlePlacementId).OnDelete(DeleteBehavior.Restrict);
        builder.HasIndex(x => x.HuddlePlacementId);
    }
}

