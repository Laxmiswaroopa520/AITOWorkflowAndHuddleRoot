using AitoWorkflowAndHuddleGenerator.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AitoWorkflowAndHuddleGenerator.Infrastructure.Persistence.Configurations;

public sealed class HuddleResourceConfiguration : IEntityTypeConfiguration<HuddleResource>
{
    public void Configure(EntityTypeBuilder<HuddleResource> builder)
    {
        builder.ToTable("HuddleResources"); builder.HasKey(x => x.Id); builder.Property(x => x.ExternalId).HasMaxLength(100).IsRequired(); builder.Property(x => x.Title).HasMaxLength(300).IsRequired(); builder.Property(x => x.Url).HasMaxLength(2000); builder.Property(x => x.Type).HasMaxLength(100); builder.Property(x => x.LinkLabel).HasMaxLength(200); builder.Property(x => x.CreatedAtUtc).IsRequired(); builder.HasIndex(x => x.ExternalId).IsUnique();
    }
}

