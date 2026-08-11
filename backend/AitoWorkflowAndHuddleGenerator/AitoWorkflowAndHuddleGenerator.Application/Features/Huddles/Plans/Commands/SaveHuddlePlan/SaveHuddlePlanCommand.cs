using AitoWorkflowAndHuddleGenerator.Contracts.Huddles;
using MediatR;

namespace AitoWorkflowAndHuddleGenerator.Application.Features.Huddles.Plans.Commands.SaveHuddlePlan;

public sealed record SaveHuddlePlanCommand(
    string RoleExternalId,
    string? RowVersion,
    IReadOnlyList<SaveHuddlePlanItemRequest> Items) : IRequest<HuddlePlanResponse>;
