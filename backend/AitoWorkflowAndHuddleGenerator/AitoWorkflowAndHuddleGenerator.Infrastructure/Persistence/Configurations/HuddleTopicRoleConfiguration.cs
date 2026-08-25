using AitoWorkflowAndHuddleGenerator.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AitoWorkflowAndHuddleGenerator.Infrastructure.Persistence.Configurations;

/// <summary>
/// Configures EF Core persistence for the Huddle Topic Role entity.
/// </summary>
public sealed class HuddleTopicRoleConfiguration : IEntityTypeConfiguration<HuddleTopicRole>
{
    /// <summary>
    /// Configures the entity mapping and database constraints.
    /// </summary>
    public void Configure(EntityTypeBuilder<HuddleTopicRole> builder)
    {
        builder.ToTable("HuddleTopicRoles"); builder.HasKey(x => new { x.HuddleTopicId, x.RoleId }); builder.HasOne(x => x.HuddleTopic).WithMany(x => x.TopicRoles).HasForeignKey(x => x.HuddleTopicId).OnDelete(DeleteBehavior.Restrict); builder.HasOne(x => x.Role).WithMany().HasForeignKey(x => x.RoleId).OnDelete(DeleteBehavior.Restrict);
    }
}

