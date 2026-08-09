using AitoWorkflowAndHuddleGenerator.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AitoWorkflowAndHuddleGenerator
    .Infrastructure
    .Persistence
    .Configurations;

public sealed class UserWorkflowActivityConfiguration
    : IEntityTypeConfiguration<UserWorkflowActivity>
{
    public void Configure(
        EntityTypeBuilder<UserWorkflowActivity> builder)
    {
        builder.ToTable("UserWorkflowActivities");

        builder.HasKey(mapping => new
        {
            mapping.UserWorkflowId,
            mapping.ActivityId
        });

        builder.Property(mapping => mapping.SortOrder)
            .IsRequired();

        builder.Property(mapping => mapping.AddedAtUtc)
            .IsRequired();

        builder.HasIndex(mapping => mapping.ActivityId);

        builder.HasIndex(mapping => new
        {
            mapping.UserWorkflowId,
            mapping.SortOrder
        });

        builder.HasOne(mapping => mapping.UserWorkflow)
            .WithMany(workflow =>
                workflow.UserWorkflowActivities)
            .HasForeignKey(mapping =>
                mapping.UserWorkflowId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(mapping => mapping.Activity)
            .WithMany(activity =>
                activity.UserWorkflowActivities)
            .HasForeignKey(mapping =>
                mapping.ActivityId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}