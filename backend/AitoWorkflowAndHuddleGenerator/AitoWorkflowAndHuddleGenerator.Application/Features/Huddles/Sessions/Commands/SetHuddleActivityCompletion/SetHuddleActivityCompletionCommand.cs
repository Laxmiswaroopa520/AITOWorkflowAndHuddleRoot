using AitoWorkflowAndHuddleGenerator.Contracts.Huddles;
using MediatR;

namespace AitoWorkflowAndHuddleGenerator.Application.Features.Huddles.Sessions.Commands.SetHuddleActivityCompletion;

/// <summary>
/// Represents the Set Huddle Activity Completion Command command.
/// </summary>
public sealed record SetHuddleActivityCompletionCommand(
    string HuddleExternalId,
    string ActivityExternalId,
    bool IsCompleted,
    string RowVersion) : IRequest<HuddleSessionResponse>;
