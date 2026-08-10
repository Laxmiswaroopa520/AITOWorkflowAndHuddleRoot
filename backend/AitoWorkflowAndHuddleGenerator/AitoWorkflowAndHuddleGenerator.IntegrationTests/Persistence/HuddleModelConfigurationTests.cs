using AitoWorkflowAndHuddleGenerator.Domain.Entities;
using AitoWorkflowAndHuddleGenerator.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Metadata;

namespace AitoWorkflowAndHuddleGenerator.IntegrationTests.Persistence;

public sealed class HuddleModelConfigurationTests
{
    private static IModel CreateModel()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseSqlServer("Server=(localdb)\\mssqllocaldb;Database=HuddleModelTests;Trusted_Connection=True")
            .Options;
        using var context = new ApplicationDbContext(options);
        return context.GetService<IDesignTimeModel>().Model;
    }

    [Fact]
    public void PlanItems_ShouldAllowOnlyOneTopicPerPlanAndWeek()
    {
        var entity = CreateModel().FindEntityType(typeof(UserHuddlePlanItem))!;
        Assert.Equal(
            new[] { nameof(UserHuddlePlanItem.UserHuddlePlanId), nameof(UserHuddlePlanItem.WeekPosition) },
            entity.FindPrimaryKey()!.Properties.Select(x => x.Name));
    }

    [Fact]
    public void Votes_ShouldBeUniquePerUserAndTopic()
    {
        var entity = CreateModel().FindEntityType(typeof(HuddleVote))!;
        Assert.Contains(entity.GetIndexes(), index => index.IsUnique &&
            index.Properties.Select(x => x.Name).SequenceEqual(new[] { nameof(HuddleVote.OwnerObjectId), nameof(HuddleVote.HuddleTopicId) }));
        Assert.Contains(entity.GetCheckConstraints(), check => check.Name == "CK_HuddleVotes_Value");
    }

    [Theory]
    [InlineData(typeof(HuddleTopic), "CK_HuddleTopics_DurationMinutes")]
    [InlineData(typeof(HuddlePhase), "CK_HuddlePhases_DurationMinutes")]
    [InlineData(typeof(HuddleActivity), "CK_HuddleActivities_DurationMinutes")]
    public void DurationEntities_ShouldHavePositiveDurationConstraints(Type type, string constraint)
    {
        Assert.Contains(CreateModel().FindEntityType(type)!.GetCheckConstraints(), check => check.Name == constraint);
    }

    [Fact]
    public void PlansAndSessions_ShouldUseSqlServerRowVersion()
    {
        foreach (var type in new[] { typeof(UserHuddlePlan), typeof(UserHuddleSession) })
        {
            var property = CreateModel().FindEntityType(type)!.FindProperty("RowVersion")!;
            Assert.True(property.IsConcurrencyToken);
            Assert.Equal(ValueGenerated.OnAddOrUpdate, property.ValueGenerated);
        }
    }

    [Fact]
    public void CatalogReferences_ShouldRestrictDeletes()
    {
        var model = CreateModel();
        var phaseTopic = model.FindEntityType(typeof(HuddlePhase))!.GetForeignKeys().Single(x => x.PrincipalEntityType.ClrType == typeof(HuddleTopic));
        var activityPhase = model.FindEntityType(typeof(HuddleActivity))!.GetForeignKeys().Single(x => x.PrincipalEntityType.ClrType == typeof(HuddlePhase));

        Assert.Equal(DeleteBehavior.Restrict, phaseTopic.DeleteBehavior);
        Assert.Equal(DeleteBehavior.Restrict, activityPhase.DeleteBehavior);
        Assert.True(phaseTopic.Properties.All(x => !x.IsNullable));
        Assert.True(activityPhase.Properties.All(x => !x.IsNullable));
    }

    [Fact]
    public void UserOwnedChildren_ShouldCascadeFromTheirAggregateOnly()
    {
        var model = CreateModel();
        var itemPlan = model.FindEntityType(typeof(UserHuddlePlanItem))!.GetForeignKeys().Single(x => x.PrincipalEntityType.ClrType == typeof(UserHuddlePlan));
        var progressSession = model.FindEntityType(typeof(UserHuddleActivityProgress))!.GetForeignKeys().Single(x => x.PrincipalEntityType.ClrType == typeof(UserHuddleSession));

        Assert.Equal(DeleteBehavior.Cascade, itemPlan.DeleteBehavior);
        Assert.Equal(DeleteBehavior.Cascade, progressSession.DeleteBehavior);
    }
}
