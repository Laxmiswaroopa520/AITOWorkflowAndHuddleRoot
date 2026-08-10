using AitoWorkflowAndHuddleGenerator.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AitoWorkflowAndHuddleGenerator.Infrastructure.Persistence.Configurations;

public sealed class HuddleTopicRoleConfiguration : IEntityTypeConfiguration<HuddleTopicRole>
{
    public void Configure(EntityTypeBuilder<HuddleTopicRole> builder)
    {
        builder.ToTable("HuddleTopicRoles"); builder.HasKey(x => new { x.HuddleTopicId, x.RoleId }); builder.HasOne(x => x.HuddleTopic).WithMany(x => x.TopicRoles).HasForeignKey(x => x.HuddleTopicId).OnDelete(DeleteBehavior.Restrict); builder.HasOne(x => x.Role).WithMany().HasForeignKey(x => x.RoleId).OnDelete(DeleteBehavior.Restrict);
    }
}

