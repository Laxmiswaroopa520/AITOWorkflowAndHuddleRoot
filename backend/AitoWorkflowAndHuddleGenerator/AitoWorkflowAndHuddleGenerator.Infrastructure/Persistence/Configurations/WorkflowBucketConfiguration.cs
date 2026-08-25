using AitoWorkflowAndHuddleGenerator.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AitoWorkflowAndHuddleGenerator
    .Infrastructure
    .Persistence
    .Configurations;

/// <summary>
/// Configures EF Core persistence for the Workflow Bucket entity.
/// </summary>
public sealed class WorkflowBucketConfiguration
    : IEntityTypeConfiguration<WorkflowBucket>
{
    /// <summary>
    /// Configures the entity mapping and database constraints.
    /// </summary>
    public void Configure(
        EntityTypeBuilder<WorkflowBucket> builder)
    {
        builder.ToTable("WorkflowBuckets");

        builder.HasKey(bucket => bucket.Id);

        builder.Property(bucket => bucket.Id)
            .ValueGeneratedOnAdd();

        builder.Property(bucket => bucket.ExternalId)
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(bucket => bucket.Name)
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(bucket => bucket.Description)
            .HasMaxLength(1000);

        builder.Property(bucket => bucket.CreatedAtUtc)
            .IsRequired();

        builder.HasIndex(bucket => bucket.ExternalId)
            .IsUnique();

        builder.HasIndex(bucket => bucket.Name)
            .IsUnique();

        builder.HasIndex(bucket => new
        {
            bucket.IsActive,
            bucket.SortOrder
        });
    }
}