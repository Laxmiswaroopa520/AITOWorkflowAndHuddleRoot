using AitoWorkflowAndHuddleGenerator.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AitoWorkflowAndHuddleGenerator.Infrastructure.Persistence.Configurations;

/// <summary>
/// Maps one appearance of a topic on a role's path. The natural key is segment role plus
/// path section plus sequence, because sequence numbers restart in each section: the same
/// role can hold sequence 2 in both SEC-ROLEPATH and SEC-ADDITIONAL.
/// </summary>
public sealed class HuddlePlacementConfiguration : IEntityTypeConfiguration<HuddlePlacement>
{
    public void Configure(EntityTypeBuilder<HuddlePlacement> builder)
    {
        builder.ToTable("HuddlePlacements", t => t.HasCheckConstraint("CK_HuddlePlacements_Sequence", "[Sequence] > 0"));
        builder.HasKey(x => x.Id);
        builder.Property(x => x.ExternalId).HasMaxLength(100).IsRequired();
        builder.Property(x => x.PathSection).HasMaxLength(50).IsRequired();
        builder.Property(x => x.RoleTopicName).HasMaxLength(300).IsRequired();
        builder.Property(x => x.CreatedAtUtc).IsRequired();
        builder.HasIndex(x => x.ExternalId).IsUnique();
        builder.HasIndex(x => new { x.HuddleSegmentRoleId, x.PathSection, x.Sequence }).IsUnique();
        builder.HasIndex(x => x.HuddleTopicId);
        builder.HasOne(x => x.HuddleSegmentRole).WithMany(x => x.Placements).HasForeignKey(x => x.HuddleSegmentRoleId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(x => x.HuddleTopic).WithMany(x => x.Placements).HasForeignKey(x => x.HuddleTopicId).OnDelete(DeleteBehavior.Restrict);
    }
}
