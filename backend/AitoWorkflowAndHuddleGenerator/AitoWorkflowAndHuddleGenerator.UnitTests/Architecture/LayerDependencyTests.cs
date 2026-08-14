using System.Reflection;

namespace AitoWorkflowAndHuddleGenerator.UnitTests.Architecture;

public sealed class LayerDependencyTests
{
    [Theory]
    [InlineData("AitoWorkflowAndHuddleGenerator.Domain", "AitoWorkflowAndHuddleGenerator.Application")]
    [InlineData("AitoWorkflowAndHuddleGenerator.Domain", "AitoWorkflowAndHuddleGenerator.Infrastructure")]
    [InlineData("AitoWorkflowAndHuddleGenerator.Domain", "AitoWorkflowAndHuddleGenerator.Api")]
    [InlineData("AitoWorkflowAndHuddleGenerator.Contracts", "AitoWorkflowAndHuddleGenerator.Application")]
    [InlineData("AitoWorkflowAndHuddleGenerator.Contracts", "AitoWorkflowAndHuddleGenerator.Infrastructure")]
    [InlineData("AitoWorkflowAndHuddleGenerator.Contracts", "AitoWorkflowAndHuddleGenerator.Api")]
    [InlineData("AitoWorkflowAndHuddleGenerator.Application", "AitoWorkflowAndHuddleGenerator.Infrastructure")]
    [InlineData("AitoWorkflowAndHuddleGenerator.Application", "AitoWorkflowAndHuddleGenerator.Api")]
    public void Inner_layer_does_not_reference_outer_layer(
        string innerAssemblyName,
        string forbiddenAssemblyName)
    {
        Assembly innerAssembly = Assembly.Load(innerAssemblyName);

        bool hasForbiddenReference = innerAssembly
            .GetReferencedAssemblies()
            .Any(reference => reference.Name == forbiddenAssemblyName);

        Assert.False(
            hasForbiddenReference,
            $"{innerAssemblyName} must not reference {forbiddenAssemblyName}.");
    }
}
