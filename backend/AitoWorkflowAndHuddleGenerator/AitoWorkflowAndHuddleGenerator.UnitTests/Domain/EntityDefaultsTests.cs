
using AitoWorkflowAndHuddleGenerator.Domain.Entities;

namespace AitoWorkflowAndHuddleGenerator.UnitTests.Domain;

public sealed class EntityDefaultsTests
{
    [Fact]
    public void Role_ShouldBeActiveByDefault()
    {
        var role = new Role();

        Assert.True(role.IsActive);
    }

    [Fact]
    public void AiTool_ShouldBeActiveByDefault()
    {
        var tool = new AiTool();

        Assert.True(tool.IsActive);
    }

    [Fact]
    public void WorkflowBucket_ShouldBeActiveByDefault()
    {
        var bucket = new WorkflowBucket();

        Assert.True(bucket.IsActive);
    }

    [Fact]
    public void Activity_ShouldBeActiveByDefault()
    {
        var activity = new Activity();

        Assert.True(activity.IsActive);
    }

    [Fact]
    public void Workflow_ShouldNotBeFavoriteByDefault()
    {
        var workflow = new UserWorkflow();

        Assert.False(workflow.IsFavorite);
    }

    [Fact]
    public void WorkflowShare_ShouldNotBeRevokedByDefault()
    {
        var share = new WorkflowShare();

        Assert.False(share.IsRevoked);
    }
}