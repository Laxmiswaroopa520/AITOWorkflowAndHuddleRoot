using AitoWorkflowAndHuddleGenerator.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AitoWorkflowAndHuddleGenerator.Infrastructure.Persistence.Configurations;

/// <summary>Configures persistence for authenticated Huddle launch plans.</summary>
public sealed class UserHuddleLaunchPlanConfiguration : IEntityTypeConfiguration<UserHuddleLaunchPlan>
{
    /// <summary>Configures the entity mapping, ownership index, and concurrency token.</summary>
    public void Configure(EntityTypeBuilder<UserHuddleLaunchPlan> builder)
    {
        builder.ToTable("UserHuddleLaunchPlans");
        builder.HasKey(item => item.Id);
        builder.Property(item => item.Id).ValueGeneratedNever();
        builder.Property(item => item.OwnerObjectId).HasMaxLength(100).IsRequired();
        builder.Property(item => item.TeamName).HasMaxLength(200).IsRequired();
        builder.Property(item => item.CohortName).HasMaxLength(200).IsRequired();
        builder.Property(item => item.SponsorName).HasMaxLength(200).IsRequired();
        builder.Property(item => item.Managers).HasMaxLength(2000).IsRequired();
        builder.Property(item => item.Facilitators).HasMaxLength(2000).IsRequired();
        builder.Property(item => item.ProgramLead).HasMaxLength(200).IsRequired();
        builder.Property(item => item.TaskStateJson).HasColumnType("nvarchar(max)").IsRequired();
        builder.Property(item => item.CreatedAtUtc).IsRequired();
        builder.Property(item => item.RowVersion).IsRowVersion().IsConcurrencyToken();
        builder.HasIndex(item => item.OwnerObjectId).IsUnique();
    }
}
