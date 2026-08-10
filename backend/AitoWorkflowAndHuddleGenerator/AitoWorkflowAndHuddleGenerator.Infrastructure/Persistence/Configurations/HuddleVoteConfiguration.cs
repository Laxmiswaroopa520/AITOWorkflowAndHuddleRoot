using AitoWorkflowAndHuddleGenerator.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AitoWorkflowAndHuddleGenerator.Infrastructure.Persistence.Configurations;

public sealed class HuddleVoteConfiguration : IEntityTypeConfiguration<HuddleVote>
{
    public void Configure(EntityTypeBuilder<HuddleVote> builder)
    {
        builder.ToTable("HuddleVotes", t => t.HasCheckConstraint("CK_HuddleVotes_Value", "[Value] IN (-1, 1)")); builder.HasKey(x => x.Id); builder.Property(x => x.Id).ValueGeneratedNever(); builder.Property(x => x.OwnerObjectId).HasMaxLength(100).IsRequired(); builder.Property(x => x.Value).HasConversion<int>(); builder.Property(x => x.Comment).HasMaxLength(2000); builder.Property(x => x.CreatedAtUtc).IsRequired(); builder.HasIndex(x => new { x.OwnerObjectId, x.HuddleTopicId }).IsUnique(); builder.HasOne(x => x.HuddleTopic).WithMany().HasForeignKey(x => x.HuddleTopicId).OnDelete(DeleteBehavior.Restrict);
    }
}

