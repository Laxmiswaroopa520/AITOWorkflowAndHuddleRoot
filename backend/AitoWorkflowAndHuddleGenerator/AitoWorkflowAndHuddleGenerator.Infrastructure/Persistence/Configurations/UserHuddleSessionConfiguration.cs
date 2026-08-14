using AitoWorkflowAndHuddleGenerator.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AitoWorkflowAndHuddleGenerator.Infrastructure.Persistence.Configurations;

/// <summary>
/// Configures EF Core persistence for the User Huddle Session entity.
/// </summary>
public sealed class UserHuddleSessionConfiguration : IEntityTypeConfiguration<UserHuddleSession>
{
    /// <summary>
    /// Configures the entity mapping and database constraints.
    /// </summary>
    public void Configure(EntityTypeBuilder<UserHuddleSession> builder)
    {
        builder.ToTable("UserHuddleSessions");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).ValueGeneratedNever();
        builder.Property(x => x.OwnerObjectId).HasMaxLength(100).IsRequired();
        builder.Property(x => x.Notes).HasMaxLength(4000);
        builder.Property(x => x.StartedAtUtc).IsRequired();
        builder.Property(x => x.LastSavedAtUtc).IsRequired();
        builder.Property(x => x.SessionStatus).HasConversion<string>().HasMaxLength(20).IsRequired();
        builder.Property(x => x.CreatedAtUtc).IsRequired();
        builder.Property(x => x.RowVersion).IsRowVersion().IsConcurrencyToken();
        builder.HasIndex(x => new { x.OwnerObjectId, x.HuddleTopicId }).IsUnique();
        builder.HasOne(x => x.HuddleTopic).WithMany().HasForeignKey(x => x.HuddleTopicId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(x => x.CurrentHuddlePhase).WithMany().HasForeignKey(x => x.CurrentHuddlePhaseId).OnDelete(DeleteBehavior.Restrict);
    }
}
