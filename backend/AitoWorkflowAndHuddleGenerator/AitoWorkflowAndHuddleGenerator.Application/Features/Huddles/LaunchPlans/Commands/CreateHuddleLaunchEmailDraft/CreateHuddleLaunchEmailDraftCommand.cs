using AitoWorkflowAndHuddleGenerator.Contracts.Huddles;
using MediatR;

namespace AitoWorkflowAndHuddleGenerator.Application.Features.Huddles.LaunchPlans.Commands.CreateHuddleLaunchEmailDraft;

/// <summary>Creates a branded launch email draft in the signed-in user's mailbox.</summary>
public sealed record CreateHuddleLaunchEmailDraftCommand(string Subject, string BodyText)
    : IRequest<HuddleLaunchEmailDraftResponse>;
