using AitoWorkflowAndHuddleGenerator.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AitoWorkflowAndHuddleGenerator.Infrastructure.Persistence.Configurations;

public sealed class HuddleSegmentRoleConfiguration : IEntityTypeConfiguration<HuddleSegmentRole>
{
    public void Configure(EntityTypeBuilder<HuddleSegmentRole> builder)
    {
        builder.ToTable("HuddleSegmentRoles"); builder.HasKey(x => x.Id); builder.Property(x => x.ExternalId).HasMaxLength(100).IsRequired(); builder.Property(x => x.DisplayName).HasMaxLength(200).IsRequired(); builder.Property(x => x.CreatedAtUtc).IsRequired();
        builder.HasIndex(x => x.ExternalId).IsUnique(); builder.HasIndex(x => new { x.HuddleSegmentId, x.RoleId }).IsUnique();
        builder.HasOne(x => x.HuddleSegment).WithMany(x => x.SegmentRoles).HasForeignKey(x => x.HuddleSegmentId).OnDelete(DeleteBehavior.Restrict); builder.HasOne(x => x.Role).WithMany().HasForeignKey(x => x.RoleId).OnDelete(DeleteBehavior.Restrict);
    }
}

