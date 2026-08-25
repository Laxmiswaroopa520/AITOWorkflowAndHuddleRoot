using AitoWorkflowAndHuddleGenerator.Contracts.Huddles;

namespace AitoWorkflowAndHuddleGenerator.Application.Abstractions.Mail;

/// <summary>
/// Provides Huddle launch mail operations.
/// </summary>
public interface IHuddleLaunchMailService
{
    /// <summary>
    /// Creates a branded launch email as a draft in the signed-in user's mailbox and returns
    /// the link that opens it. Nothing is sent; the user reviews and sends it themselves.
    /// </summary>
    Task<HuddleLaunchEmailDraftResponse> CreateLaunchDraftAsync(
        CreateHuddleLaunchEmailDraftRequest request,
        CancellationToken cancellationToken);
}
