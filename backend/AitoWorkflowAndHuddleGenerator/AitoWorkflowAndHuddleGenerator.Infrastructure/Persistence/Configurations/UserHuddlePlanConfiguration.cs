using AitoWorkflowAndHuddleGenerator.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AitoWorkflowAndHuddleGenerator.Infrastructure.Persistence.Configurations;

public sealed class UserHuddlePlanConfiguration : IEntityTypeConfiguration<UserHuddlePlan>
{
    public void Configure(EntityTypeBuilder<UserHuddlePlan> builder)
    {
        builder.ToTable("UserHuddlePlans"); builder.HasKey(x => x.Id); builder.Property(x => x.Id).ValueGeneratedNever(); builder.Property(x => x.OwnerObjectId).HasMaxLength(100).IsRequired(); builder.Property(x => x.Name).HasMaxLength(200).IsRequired(); builder.Property(x => x.CreatedAtUtc).IsRequired(); builder.Property(x => x.RowVersion).IsRowVersion().IsConcurrencyToken(); builder.HasIndex(x => new { x.OwnerObjectId, x.HuddleSegmentRoleId }).IsUnique(); builder.HasOne(x => x.HuddleSegmentRole).WithMany().HasForeignKey(x => x.HuddleSegmentRoleId).OnDelete(DeleteBehavior.Restrict);
    }
}
