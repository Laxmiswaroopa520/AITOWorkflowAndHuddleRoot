/*This interceptor handles timestamps when records are added or modified through EF Core.*/
using AitoWorkflowAndHuddleGenerator.Domain.Common;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;

namespace AitoWorkflowAndHuddleGenerator
    .Infrastructure
    .Persistence
    .Interceptors;

/// <summary>
/// Represents the Auditable Entity Interceptor model.
/// </summary>
public sealed class AuditableEntityInterceptor : SaveChangesInterceptor
{
    /// <summary>
    /// Executes the Saving Changes operation.
    /// </summary>
    public override InterceptionResult<int> SavingChanges(
        DbContextEventData eventData,
        InterceptionResult<int> result)
    {
        UpdateAuditValues(eventData.Context);

        return base.SavingChanges(eventData, result);
    }

    /// <summary>
    /// Executes the Saving Changes Async operation.
    /// </summary>

    public override ValueTask<InterceptionResult<int>>
        SavingChangesAsync(
            DbContextEventData eventData,
            InterceptionResult<int> result,
            CancellationToken cancellationToken = default)
    {
        UpdateAuditValues(eventData.Context);

        return base.SavingChangesAsync(
            eventData,
            result,
            cancellationToken);
    }

    private static void UpdateAuditValues(DbContext? dbContext)
    {
        if (dbContext is null)
        {
            return;
        }

        DateTimeOffset utcNow = DateTimeOffset.UtcNow;

        foreach (var entry in dbContext.ChangeTracker.Entries())
        {
            if (entry.Entity is not AuditableEntity<int> &&
                entry.Entity is not AuditableEntity<Guid>)
            {
                continue;
            }

            if (entry.State == EntityState.Added)
            {
                entry.Property(nameof(
                        AuditableEntity<int>.CreatedAtUtc))
                    .CurrentValue = utcNow;

                entry.Property(nameof(
                        AuditableEntity<int>.UpdatedAtUtc))
                    .CurrentValue = null;
            }

            if (entry.State == EntityState.Modified)
            {
                entry.Property(nameof(
                        AuditableEntity<int>.CreatedAtUtc))
                    .IsModified = false;

                entry.Property(nameof(
                        AuditableEntity<int>.UpdatedAtUtc))
                    .CurrentValue = utcNow;
            }
        }
    }
}