using AitoWorkflowAndHuddleGenerator.Contracts.Huddles;
using MediatR;

namespace AitoWorkflowAndHuddleGenerator.Application.Features.Huddles.Sessions.Commands.SetHuddleActivityCompletion;

public sealed record SetHuddleActivityCompletionCommand(
    string HuddleExternalId,
    string ActivityExternalId,
    bool IsCompleted,
    string RowVersion) : IRequest<HuddleSessionResponse>;
