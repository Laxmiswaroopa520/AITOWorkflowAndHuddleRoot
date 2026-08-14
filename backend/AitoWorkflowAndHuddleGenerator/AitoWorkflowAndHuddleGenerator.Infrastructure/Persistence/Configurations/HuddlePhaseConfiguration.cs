using AitoWorkflowAndHuddleGenerator.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AitoWorkflowAndHuddleGenerator.Infrastructure.Persistence.Configurations;

/// <summary>
/// Configures EF Core persistence for the Huddle Phase entity.
/// </summary>
public sealed class HuddlePhaseConfiguration : IEntityTypeConfiguration<HuddlePhase>
{
    /// <summary>
    /// Configures the entity mapping and database constraints.
    /// </summary>
    public void Configure(EntityTypeBuilder<HuddlePhase> builder)
    {
        builder.ToTable("HuddlePhases", t => t.HasCheckConstraint("CK_HuddlePhases_DurationMinutes", "[DurationMinutes] IS NULL OR [DurationMinutes] > 0")); 
        builder.HasKey(x => x.Id);
        builder.Property(x => x.ExternalId).HasMaxLength(100).IsRequired(); builder.Property(x => x.Name).HasMaxLength(300).IsRequired(); 
        builder.Property(x => x.CreatedAtUtc).IsRequired(); builder.HasIndex(x => x.ExternalId).IsUnique();
        builder.HasIndex(x => new { x.HuddleTopicId, x.DisplayOrder }).IsUnique(); builder.HasOne(x => x.HuddleTopic).WithMany(x => x.Phases).HasForeignKey(x => x.HuddleTopicId).OnDelete(DeleteBehavior.Restrict);
    }
}

