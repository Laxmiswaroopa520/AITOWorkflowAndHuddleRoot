//Represents a request to load AI tools.
using AitoWorkflowAndHuddleGenerator.Contracts.AiTools;
using MediatR;

namespace AitoWorkflowAndHuddleGenerator
    .Application
    .Features
    .AiTools
    .Queries
    .GetAiTools;

/// <summary>
/// Represents the Get Ai Tools Query query.
/// </summary>
public sealed record GetAiToolsQuery(
    bool IncludeInactive = false)
    : IRequest<IReadOnlyList<AiToolResponse>>;