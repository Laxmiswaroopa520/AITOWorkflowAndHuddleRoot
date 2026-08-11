using AitoWorkflowAndHuddleGenerator.Contracts.Huddles;
using MediatR;

namespace AitoWorkflowAndHuddleGenerator.Application.Features.Huddles.Catalog.Queries.GetRecommendedPath;

public sealed record GetRecommendedPathQuery(string RoleExternalId) : IRequest<RecommendedHuddlePathResponse>;

