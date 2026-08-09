using AitoWorkflowAndHuddleGenerator.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AitoWorkflowAndHuddleGenerator
    .Infrastructure
    .Persistence
    .Configurations;

public sealed class ActivityAiToolConfiguration
    : IEntityTypeConfiguration<ActivityAiTool>
{
    public void Configure(
        EntityTypeBuilder<ActivityAiTool> builder)
    {
        builder.ToTable("ActivityAiTools");

        builder.HasKey(mapping => new
        {
            mapping.ActivityId,
            mapping.AiToolId
        });

        builder.Property(mapping => mapping.SortOrder)
            .IsRequired();

        builder.Property(mapping => mapping.IsPrimary)
            .IsRequired();

        builder.HasIndex(mapping => mapping.AiToolId);

        builder.HasOne(mapping => mapping.Activity)
            .WithMany(activity =>
                activity.ActivityAiTools)
            .HasForeignKey(mapping =>
                mapping.ActivityId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(mapping => mapping.AiTool)
            .WithMany(tool => tool.ActivityAiTools)
            .HasForeignKey(mapping =>
                mapping.AiToolId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}