using AitoWorkflowAndHuddleGenerator.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AitoWorkflowAndHuddleGenerator.Infrastructure.Persistence.Configurations;

/// <summary>
/// Configures EF Core persistence for the Huddle Agent entity.
/// </summary>
public sealed class HuddleAgentConfiguration : IEntityTypeConfiguration<HuddleAgent>
{
    /// <summary>
    /// Configures the entity mapping and database constraints.
    /// </summary>
    public void Configure(EntityTypeBuilder<HuddleAgent> builder)
    {
        builder.ToTable("HuddleAgents"); builder.HasKey(x => x.Id); builder.Property(x => x.ExternalId).HasMaxLength(100).IsRequired(); builder.Property(x => x.Name).HasMaxLength(200).IsRequired(); builder.Property(x => x.ShortDescription).HasMaxLength(1000); builder.Property(x => x.AccessUrl).HasMaxLength(2000); builder.Property(x => x.AccessLinkLabel).HasMaxLength(200); builder.Property(x => x.CreatedAtUtc).IsRequired(); builder.HasIndex(x => x.ExternalId).IsUnique();
    }
}

