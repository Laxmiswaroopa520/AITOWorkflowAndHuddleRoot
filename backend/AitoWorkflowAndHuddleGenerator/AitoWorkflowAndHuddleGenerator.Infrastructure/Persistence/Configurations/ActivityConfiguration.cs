using AitoWorkflowAndHuddleGenerator.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AitoWorkflowAndHuddleGenerator
    .Infrastructure
    .Persistence
    .Configurations;

/// <summary>
/// Configures EF Core persistence for the Activity entity.
/// </summary>
public sealed class ActivityConfiguration
    : IEntityTypeConfiguration<Activity>
{
    /// <summary>
    /// Configures the entity mapping and database constraints.
    /// </summary>
    public void Configure(EntityTypeBuilder<Activity> builder)
    {
        builder.ToTable("Activities");

        builder.HasKey(activity => activity.Id);

        builder.Property(activity => activity.Id)
            .ValueGeneratedOnAdd();

        builder.Property(activity => activity.ExternalId)
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(activity => activity.Title)
            .HasMaxLength(250)
            .IsRequired();

        builder.Property(activity => activity.Description)
            .HasMaxLength(4000);

        builder.Property(activity => activity.BusinessOutcome)
            .HasMaxLength(2000);

        builder.Property(activity => activity.BeginnerPrompt)
            .HasColumnType("nvarchar(max)");

        builder.Property(activity => activity.AdvancedPrompt)
            .HasColumnType("nvarchar(max)");

        builder.Property(activity => activity.SuggestedOutputs)
            .HasColumnType("nvarchar(max)");

        builder.Property(activity => activity.Category)
            .HasConversion<string>()
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(activity => activity.Frequency)
            .HasConversion<string>()
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(activity => activity.Priority)
            .HasConversion<string>()
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(activity => activity.ToolCoverageLevel)
            .HasConversion<string>()
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(activity => activity.TriggerContext)
            .HasConversion<string>()
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(activity => activity.McemStage)
            .HasConversion<string>()
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(activity => activity.DurationMinutes)
            .IsRequired();

        builder.Property(activity => activity.CreatedAtUtc)
            .IsRequired();

        builder.ToTable(tableBuilder =>
        {
            tableBuilder.HasCheckConstraint(
                "CK_Activities_DurationMinutes",
                "[DurationMinutes] >= 0");
        });

        builder.HasIndex(activity => activity.ExternalId)
            .IsUnique();

        builder.HasIndex(activity => activity.RoleId);

        builder.HasIndex(activity =>
            activity.WorkflowBucketId);

        builder.HasIndex(activity => activity.Category);

        builder.HasIndex(activity => activity.Priority);

        builder.HasIndex(activity => activity.McemStage);

        builder.HasIndex(activity => new
        {
            activity.RoleId,
            activity.WorkflowBucketId,
            activity.IsActive
        });

        builder.HasOne(activity => activity.Role)
            .WithMany(role => role.Activities)
            .HasForeignKey(activity => activity.RoleId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(activity => activity.WorkflowBucket)
            .WithMany(bucket => bucket.Activities)
            .HasForeignKey(activity =>
                activity.WorkflowBucketId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}