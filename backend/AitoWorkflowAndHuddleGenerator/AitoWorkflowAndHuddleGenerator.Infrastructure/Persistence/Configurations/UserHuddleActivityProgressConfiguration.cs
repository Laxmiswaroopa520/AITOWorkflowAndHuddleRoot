using AitoWorkflowAndHuddleGenerator.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AitoWorkflowAndHuddleGenerator.Infrastructure.Persistence.Configurations;

/// <summary>
/// Configures EF Core persistence for the User Huddle Activity Progress entity.
/// </summary>
public sealed class UserHuddleActivityProgressConfiguration : IEntityTypeConfiguration<UserHuddleActivityProgress>
{
    /// <summary>
    /// Configures the entity mapping and database constraints.
    /// </summary>
    public void Configure(EntityTypeBuilder<UserHuddleActivityProgress> builder)
    {
        builder.ToTable("UserHuddleActivityProgress"); builder.HasKey(x => new { x.UserHuddleSessionId, x.HuddleActivityId }); builder.HasOne(x => x.UserHuddleSession).WithMany(x => x.ActivityProgress).HasForeignKey(x => x.UserHuddleSessionId).OnDelete(DeleteBehavior.Cascade); builder.HasOne(x => x.HuddleActivity).WithMany().HasForeignKey(x => x.HuddleActivityId).OnDelete(DeleteBehavior.Restrict);
    }
}

