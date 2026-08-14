using AitoWorkflowAndHuddleGenerator.Contracts.Huddles;
using MediatR;

namespace AitoWorkflowAndHuddleGenerator.Application.Features.Huddles.Catalog.Queries.GetHuddleCatalog;

/// <summary>
/// Represents the Get Huddle Catalog Query query.
/// </summary>
public sealed record GetHuddleCatalogQuery(
    string? RoleExternalId,
    string? FocusAreaExternalId,
    string? AgentExternalId,
    string? Type,
    string? Search,
    string? Sort) : IRequest<IReadOnlyList<HuddleCatalogItemResponse>>;

