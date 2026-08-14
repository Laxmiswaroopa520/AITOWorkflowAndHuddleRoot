using AitoWorkflowAndHuddleGenerator.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AitoWorkflowAndHuddleGenerator.Infrastructure.Persistence.Configurations;

/// <summary>
/// Configures EF Core persistence for the Huddle Focus Area entity.
/// </summary>
public sealed class HuddleFocusAreaConfiguration : IEntityTypeConfiguration<HuddleFocusArea>
{
    /// <summary>
    /// Configures the entity mapping and database constraints.
    /// </summary>
    public void Configure(EntityTypeBuilder<HuddleFocusArea> builder)
    {
        builder.ToTable("HuddleFocusAreas"); 
        builder.HasKey(x => x.Id); builder.Property(x => x.ExternalId).HasMaxLength(100).IsRequired();
        builder.Property(x => x.Name).HasMaxLength(200).IsRequired();
        builder.Property(x => x.CreatedAtUtc).IsRequired();
        builder.HasIndex(x => x.ExternalId).IsUnique();
    }
}

