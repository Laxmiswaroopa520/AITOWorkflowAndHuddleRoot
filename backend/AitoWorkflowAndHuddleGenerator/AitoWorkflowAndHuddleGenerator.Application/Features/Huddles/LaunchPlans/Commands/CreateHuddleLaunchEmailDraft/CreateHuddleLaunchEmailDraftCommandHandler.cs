using AitoWorkflowAndHuddleGenerator.Application.Abstractions.Mail;
using AitoWorkflowAndHuddleGenerator.Contracts.Huddles;
using MediatR;

namespace AitoWorkflowAndHuddleGenerator.Application.Features.Huddles.LaunchPlans.Commands.CreateHuddleLaunchEmailDraft;

/// <summary>Handles creation of the branded launch email draft.</summary>
public sealed class CreateHuddleLaunchEmailDraftCommandHandler(IHuddleLaunchMailService mailService)
    : IRequestHandler<CreateHuddleLaunchEmailDraftCommand, HuddleLaunchEmailDraftResponse>
{
    /// <summary>Handles the request through the application pipeline.</summary>
    public Task<HuddleLaunchEmailDraftResponse> Handle(
        CreateHuddleLaunchEmailDraftCommand request,
        CancellationToken cancellationToken) =>
        mailService.CreateLaunchDraftAsync(
            new CreateHuddleLaunchEmailDraftRequest(request.Subject, request.BodyText),
            cancellationToken);
}
