using AitoWorkflowAndHuddleGenerator.Contracts.Huddles;
using MediatR;

namespace AitoWorkflowAndHuddleGenerator.Application.Features.Huddles.Catalog.Queries.GetHuddleById;

/// <summary>
/// Represents the Get Huddle By Id Query query.
/// </summary>
public sealed record GetHuddleByIdQuery(string ExternalId) : IRequest<HuddleDetailResponse>;

