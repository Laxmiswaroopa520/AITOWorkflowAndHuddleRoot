using AitoWorkflowAndHuddleGenerator.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AitoWorkflowAndHuddleGenerator.Infrastructure.Persistence.Configurations;

public sealed class UserHuddleActivityProgressConfiguration : IEntityTypeConfiguration<UserHuddleActivityProgress>
{
    public void Configure(EntityTypeBuilder<UserHuddleActivityProgress> builder)
    {
        builder.ToTable("UserHuddleActivityProgress"); builder.HasKey(x => new { x.UserHuddleSessionId, x.HuddleActivityId }); builder.HasOne(x => x.UserHuddleSession).WithMany(x => x.ActivityProgress).HasForeignKey(x => x.UserHuddleSessionId).OnDelete(DeleteBehavior.Cascade); builder.HasOne(x => x.HuddleActivity).WithMany().HasForeignKey(x => x.HuddleActivityId).OnDelete(DeleteBehavior.Restrict);
    }
}

