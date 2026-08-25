using AitoWorkflowAndHuddleGenerator.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AitoWorkflowAndHuddleGenerator
    .Infrastructure
    .Persistence
    .Configurations;

/// <summary>
/// Configures EF Core persistence for the Role entity.
/// </summary>
public sealed class RoleConfiguration
    : IEntityTypeConfiguration<Role>
{
    /// <summary>
    /// Configures the entity mapping and database constraints.
    /// </summary>
    public void Configure(EntityTypeBuilder<Role> builder)
    {
        builder.ToTable("Roles");

        builder.HasKey(role => role.Id);

        builder.Property(role => role.Id)
            .ValueGeneratedOnAdd();

        builder.Property(role => role.ExternalId)
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(role => role.Name)
            .HasMaxLength(150)
            .IsRequired();

        builder.Property(role => role.Abbreviation)
            .HasMaxLength(30)
            .IsRequired();

        builder.Property(role => role.Segment)
            .HasMaxLength(50);

        builder.Property(role => role.Description)
            .HasMaxLength(1000);

        builder.Property(role => role.CreatedAtUtc)
            .IsRequired();

        builder.HasIndex(role => role.ExternalId)
            .IsUnique();

        builder.HasIndex(role => role.Name);

        builder.HasIndex(role => new
        {
            role.IsActive,
            role.SortOrder
        });
    }
}