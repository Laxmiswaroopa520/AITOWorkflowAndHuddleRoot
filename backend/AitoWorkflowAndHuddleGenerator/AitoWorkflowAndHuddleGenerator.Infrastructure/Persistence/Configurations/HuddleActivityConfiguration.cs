using AitoWorkflowAndHuddleGenerator.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AitoWorkflowAndHuddleGenerator.Infrastructure.Persistence.Configurations;

/// <summary>
/// Configures EF Core persistence for the Huddle Activity entity.
/// </summary>
public sealed class HuddleActivityConfiguration : IEntityTypeConfiguration<HuddleActivity>
{
    /// <summary>
    /// Configures the entity mapping and database constraints.
    /// </summary>
    public void Configure(EntityTypeBuilder<HuddleActivity> builder)
    {
        builder.ToTable("HuddleActivities", t => t.HasCheckConstraint("CK_HuddleActivities_DurationMinutes", "[DurationMinutes] IS NULL OR [DurationMinutes] > 0")); builder.HasKey(x => x.Id); builder.Property(x => x.ExternalId).HasMaxLength(100).IsRequired(); builder.Property(x => x.Name).HasMaxLength(300).IsRequired(); builder.Property(x => x.CreatedAtUtc).IsRequired(); builder.Property(x => x.PracticeTier).HasConversion<string>().HasMaxLength(20).IsRequired();
        builder.Property(x => x.ExecutionMethod).HasConversion<string>().HasMaxLength(20).IsRequired();
        builder.Property(x => x.LaunchUrl).HasMaxLength(2000);
        builder.Property(x => x.LaunchLabel).HasMaxLength(200);
        builder.HasIndex(x => x.ExternalId).IsUnique();
        // Ordering is unique within a phase. Phases are per placement in V4 content, so the
        // index is split: legacy topic-scoped rows keep their guarantee, placement rows get their own.
        builder.HasIndex(x => new { x.HuddlePhaseId, x.DisplayOrder }).IsUnique().HasFilter("[HuddlePlacementId] IS NULL");
        builder.HasIndex(x => new { x.HuddlePlacementId, x.HuddlePhaseId, x.DisplayOrder }).IsUnique().HasFilter("[HuddlePlacementId] IS NOT NULL");
        builder.HasIndex(x => new { x.HuddlePlacementId, x.PracticeTier });
        builder.HasOne(x => x.HuddleTopic).WithMany(x => x.Activities).HasForeignKey(x => x.HuddleTopicId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(x => x.HuddlePhase).WithMany(x => x.Activities).HasForeignKey(x => x.HuddlePhaseId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(x => x.HuddlePlacement).WithMany(x => x.Activities).HasForeignKey(x => x.HuddlePlacementId).OnDelete(DeleteBehavior.Restrict);
        // NoAction, not Restrict: a self reference on the same table cannot cascade, and
        // Restrict would still have SQL Server reject the FK on a self-referencing column.
        builder.HasOne(x => x.PrerequisiteHuddleActivity).WithMany(x => x.DependentActivities).HasForeignKey(x => x.PrerequisiteHuddleActivityId).OnDelete(DeleteBehavior.NoAction);
    }
}

