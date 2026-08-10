using AitoWorkflowAndHuddleGenerator.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AitoWorkflowAndHuddleGenerator.Infrastructure.Persistence.Configurations;

public sealed class UserHuddleSessionConfiguration : IEntityTypeConfiguration<UserHuddleSession>
{
    public void Configure(EntityTypeBuilder<UserHuddleSession> builder)
    {
        builder.ToTable("UserHuddleSessions"); builder.HasKey(x => x.Id); builder.Property(x => x.Id).ValueGeneratedNever(); builder.Property(x => x.OwnerObjectId).HasMaxLength(100).IsRequired(); builder.Property(x => x.CreatedAtUtc).IsRequired(); builder.Property(x => x.RowVersion).IsRowVersion().IsConcurrencyToken(); builder.HasOne(x => x.HuddleTopic).WithMany().HasForeignKey(x => x.HuddleTopicId).OnDelete(DeleteBehavior.Restrict); builder.HasOne(x => x.CurrentHuddlePhase).WithMany().HasForeignKey(x => x.CurrentHuddlePhaseId).OnDelete(DeleteBehavior.Restrict);
    }
}

