//This prevents the same owner from saving two workflows with the same name.

using AitoWorkflowAndHuddleGenerator.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AitoWorkflowAndHuddleGenerator
    .Infrastructure
    .Persistence
    .Configurations;

public sealed class UserWorkflowConfiguration
    : IEntityTypeConfiguration<UserWorkflow>
{
    public void Configure(
        EntityTypeBuilder<UserWorkflow> builder)
    {
        builder.ToTable("UserWorkflows");

        builder.HasKey(workflow => workflow.Id);

        builder.Property(workflow => workflow.Id)
            .ValueGeneratedNever();

        builder.Property(workflow => workflow.Name)
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(workflow => workflow.Description)
            .HasMaxLength(2000);

        builder.Property(workflow => workflow.OwnerObjectId)
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(workflow => workflow.OwnerEmail)
            .HasMaxLength(320)
            .IsRequired();

        builder.Property(workflow =>
                workflow.OwnerDisplayName)
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(workflow =>
                workflow.TotalDurationMinutes)
            .IsRequired();

        builder.Property(workflow => workflow.CreatedAtUtc)
            .IsRequired();

        builder.Property(workflow => workflow.RowVersion)
            .IsRowVersion()
            .IsConcurrencyToken();

        builder.ToTable(tableBuilder =>
        {
            tableBuilder.HasCheckConstraint(
                "CK_UserWorkflows_TotalDurationMinutes",
                "[TotalDurationMinutes] >= 0");
        });

        builder.HasIndex(workflow =>
            workflow.OwnerObjectId);

        builder.HasIndex(workflow => new
        {
            workflow.OwnerObjectId,
            workflow.Name
        })
        .IsUnique();

        builder.HasIndex(workflow => new
        {
            workflow.OwnerObjectId,
            workflow.IsFavorite
        });

        builder.HasIndex(workflow => workflow.RoleId);

        builder.HasOne(workflow => workflow.Role)
            .WithMany()
            .HasForeignKey(workflow => workflow.RoleId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}