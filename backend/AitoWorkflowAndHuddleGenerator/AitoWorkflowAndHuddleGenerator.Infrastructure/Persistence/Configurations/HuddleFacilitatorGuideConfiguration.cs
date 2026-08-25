using AitoWorkflowAndHuddleGenerator.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AitoWorkflowAndHuddleGenerator.Infrastructure.Persistence.Configurations;

/// <summary>
/// Configures EF Core persistence for the Huddle Facilitator Guide entity.
/// </summary>
public sealed class HuddleFacilitatorGuideConfiguration : IEntityTypeConfiguration<HuddleFacilitatorGuide>
{
    /// <summary>
    /// Configures the entity mapping and database constraints.
    /// </summary>
    public void Configure(EntityTypeBuilder<HuddleFacilitatorGuide> builder)
    {
        builder.ToTable("HuddleFacilitatorGuides");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.ExternalId).HasMaxLength(100).IsRequired();
        builder.Property(x => x.CreatedAtUtc).IsRequired();
        builder.HasIndex(x => x.ExternalId).IsUnique();
        // One guide per topic held for the legacy rows; V4 supplies one guide per placement,
        // so both uniqueness rules coexist as filtered indexes.
        builder.HasIndex(x => x.HuddleTopicId).IsUnique().HasFilter("[HuddlePlacementId] IS NULL");
        builder.HasIndex(x => x.HuddlePlacementId).IsUnique().HasFilter("[HuddlePlacementId] IS NOT NULL");
        builder.HasOne(x => x.HuddleTopic).WithMany(x => x.FacilitatorGuides).HasForeignKey(x => x.HuddleTopicId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(x => x.HuddlePlacement).WithOne(x => x.FacilitatorGuide).HasForeignKey<HuddleFacilitatorGuide>(x => x.HuddlePlacementId).OnDelete(DeleteBehavior.Restrict);

    }
}

