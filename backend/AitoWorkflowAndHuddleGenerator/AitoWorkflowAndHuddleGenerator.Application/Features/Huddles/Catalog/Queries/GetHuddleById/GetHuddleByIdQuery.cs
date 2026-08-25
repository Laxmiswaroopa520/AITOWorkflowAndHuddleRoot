using AitoWorkflowAndHuddleGenerator.Contracts.Huddles;
using MediatR;

namespace AitoWorkflowAndHuddleGenerator.Application.Features.Huddles.Catalog.Queries.GetHuddleById;

/// <summary>
/// Represents the Get Huddle By Id Query query.
/// </summary>
/// <param name="ExternalId">Topic external identifier.</param>
/// <param name="PlacementExternalId">
/// Placement to read. Supply this and phases, activities and the facilitator guide are scoped to
/// one role's appearance of the topic. Omit it and the read stays topic-scoped, which aggregates
/// every role that shares the topic and is only meaningful for single-placement topics.
/// </param>
public sealed record GetHuddleByIdQuery(string ExternalId, string? PlacementExternalId = null) : IRequest<HuddleDetailResponse>;

