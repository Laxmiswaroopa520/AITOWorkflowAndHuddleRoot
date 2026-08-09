using AitoWorkflowAndHuddleGenerator.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AitoWorkflowAndHuddleGenerator
    .Infrastructure
    .Persistence
    .Configurations;

public sealed class WorkflowShareConfiguration
    : IEntityTypeConfiguration<WorkflowShare>
{
    public void Configure(
        EntityTypeBuilder<WorkflowShare> builder)
    {
        builder.ToTable("WorkflowShares");

        builder.HasKey(share => share.Id);

        builder.Property(share => share.Id)
            .ValueGeneratedNever();

        builder.Property(share => share.RecipientObjectId)
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(share => share.RecipientEmail)
            .HasMaxLength(320)
            .IsRequired();

        builder.Property(share =>
                share.RecipientDisplayName)
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(share => share.SharedByObjectId)
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(share => share.SharedByEmail)
            .HasMaxLength(320)
            .IsRequired();

        builder.Property(share =>
                share.SharedByDisplayName)
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(share => share.Message)
            .HasMaxLength(2000);

        builder.Property(share => share.CreatedAtUtc)
            .IsRequired();

        builder.Property(share => share.RowVersion)
            .IsRowVersion()
            .IsConcurrencyToken();

        builder.HasIndex(share =>
            share.UserWorkflowId);

        builder.HasIndex(share =>
            share.RecipientObjectId);

        builder.HasIndex(share => new
        {
            share.UserWorkflowId,
            share.RecipientObjectId
        })
        .IsUnique()
        .HasFilter("[IsRevoked] = 0");

        builder.HasOne(share => share.UserWorkflow)
            .WithMany(workflow =>
                workflow.WorkflowShares)
            .HasForeignKey(share =>
                share.UserWorkflowId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}