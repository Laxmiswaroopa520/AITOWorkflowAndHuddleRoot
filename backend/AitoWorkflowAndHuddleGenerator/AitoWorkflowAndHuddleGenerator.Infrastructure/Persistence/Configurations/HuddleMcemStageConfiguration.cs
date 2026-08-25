using AitoWorkflowAndHuddleGenerator.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AitoWorkflowAndHuddleGenerator.Infrastructure.Persistence.Configurations;

/// <summary>
/// Configures EF Core persistence for the Huddle Mcem Stage entity.
/// </summary>
public sealed class HuddleMcemStageConfiguration : IEntityTypeConfiguration<HuddleMcemStage>
{
    /// <summary>
    /// Configures the entity mapping and database constraints.
    /// </summary>
    public void Configure(EntityTypeBuilder<HuddleMcemStage> builder)
    {
        builder.ToTable("HuddleMcemStages", t => t.HasCheckConstraint("CK_HuddleMcemStages_StageNumber", "[StageNumber] IS NULL OR [StageNumber] BETWEEN 1 AND 5")); 
        builder.HasKey(x => x.Id); 
        builder.Property(x => x.ExternalId).HasMaxLength(100).IsRequired();
        builder.Property(x => x.Name).HasMaxLength(200).IsRequired(); 
        builder.Property(x => x.Description).HasMaxLength(2000);
        builder.Property(x => x.CreatedAtUtc).IsRequired(); 
        builder.HasIndex(x => x.ExternalId).IsUnique();
    }
}

