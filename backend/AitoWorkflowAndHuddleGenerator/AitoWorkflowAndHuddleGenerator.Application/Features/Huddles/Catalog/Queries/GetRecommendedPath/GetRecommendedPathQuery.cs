using AitoWorkflowAndHuddleGenerator.Contracts.Huddles;
using MediatR;

namespace AitoWorkflowAndHuddleGenerator.Application.Features.Huddles.Catalog.Queries.GetRecommendedPath;

/// <summary>
/// Represents the Get Recommended Path Query query.
/// </summary>
public sealed record GetRecommendedPathQuery(string RoleExternalId) : IRequest<RecommendedHuddlePathResponse>;

