using AitoWorkflowAndHuddleGenerator.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AitoWorkflowAndHuddleGenerator
    .Infrastructure
    .Persistence
    .Configurations;

/// <summary>
/// Configures EF Core persistence for the Ai Tool entity.
/// </summary>
public sealed class AiToolConfiguration
    : IEntityTypeConfiguration<AiTool>
{
    /// <summary>
    /// Configures the entity mapping and database constraints.
    /// </summary>
    public void Configure(EntityTypeBuilder<AiTool> builder)
    {
        builder.ToTable("AiTools");

        builder.HasKey(tool => tool.Id);

        builder.Property(tool => tool.Id)
            .ValueGeneratedOnAdd();

        builder.Property(tool => tool.ExternalId)
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(tool => tool.Name)
            .HasMaxLength(150)
            .IsRequired();

        builder.Property(tool => tool.Description)
            .HasMaxLength(1000);

        builder.Property(tool => tool.Color)
            .HasMaxLength(100);

        builder.Property(tool => tool.IconKey)
            .HasMaxLength(100);

        builder.Property(tool => tool.CreatedAtUtc)
            .IsRequired();

        builder.HasIndex(tool => tool.ExternalId)
            .IsUnique();

        builder.HasIndex(tool => tool.Name)
            .IsUnique();

        builder.HasIndex(tool => new
        {
            tool.IsActive,
            tool.SortOrder
        });
    }
}