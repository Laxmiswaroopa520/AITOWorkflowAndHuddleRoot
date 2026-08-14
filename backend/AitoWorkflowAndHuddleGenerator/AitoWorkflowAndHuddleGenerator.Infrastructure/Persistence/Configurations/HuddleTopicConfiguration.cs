using AitoWorkflowAndHuddleGenerator.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AitoWorkflowAndHuddleGenerator.Infrastructure.Persistence.Configurations;

/// <summary>
/// Configures EF Core persistence for the Huddle Topic entity.
/// </summary>
public sealed class HuddleTopicConfiguration : IEntityTypeConfiguration<HuddleTopic>
{
    /// <summary>
    /// Configures the entity mapping and database constraints.
    /// </summary>
    public void Configure(EntityTypeBuilder<HuddleTopic> builder)
    {
        builder.ToTable("HuddleTopics", t => t.HasCheckConstraint("CK_HuddleTopics_DurationMinutes", "[DurationMinutes] IS NULL OR [DurationMinutes] > 0")); builder.HasKey(x => x.Id);
        builder.Property(x => x.ExternalId).HasMaxLength(100).IsRequired(); builder.Property(x => x.Name).HasMaxLength(300).IsRequired(); builder.Property(x => x.Type).HasMaxLength(50).IsRequired(); builder.Property(x => x.PublicationStatus).HasMaxLength(50).IsRequired(); builder.Property(x => x.CreatedAtUtc).IsRequired(); builder.HasIndex(x => x.ExternalId).IsUnique();
        builder.HasOne(x => x.HuddleFocusArea).WithMany(x => x.Topics).HasForeignKey(x => x.HuddleFocusAreaId).OnDelete(DeleteBehavior.Restrict);
    }
}

