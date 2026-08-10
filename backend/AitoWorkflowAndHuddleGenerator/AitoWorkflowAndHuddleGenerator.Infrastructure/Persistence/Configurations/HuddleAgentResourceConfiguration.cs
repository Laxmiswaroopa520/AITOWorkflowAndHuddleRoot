using AitoWorkflowAndHuddleGenerator.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AitoWorkflowAndHuddleGenerator.Infrastructure.Persistence.Configurations;

public sealed class HuddleAgentResourceConfiguration : IEntityTypeConfiguration<HuddleAgentResource>
{
    public void Configure(EntityTypeBuilder<HuddleAgentResource> builder)
    {
        builder.ToTable("HuddleAgentResources"); builder.HasKey(x => new { x.HuddleAgentId, x.HuddleResourceId }); builder.HasIndex(x => new { x.HuddleAgentId, x.DisplayOrder }).IsUnique(); builder.HasOne(x => x.HuddleAgent).WithMany().HasForeignKey(x => x.HuddleAgentId).OnDelete(DeleteBehavior.Restrict); builder.HasOne(x => x.HuddleResource).WithMany().HasForeignKey(x => x.HuddleResourceId).OnDelete(DeleteBehavior.Restrict);
    }
}

