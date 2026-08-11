using AitoWorkflowAndHuddleGenerator.Contracts.Huddles;
using MediatR;

namespace AitoWorkflowAndHuddleGenerator.Application.Features.Huddles.Catalog.Queries.GetHuddleById;

public sealed record GetHuddleByIdQuery(string ExternalId) : IRequest<HuddleDetailResponse>;

