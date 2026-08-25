using AitoWorkflowAndHuddleGenerator.Domain.Common;

namespace AitoWorkflowAndHuddleGenerator.Domain.Entities;

/// <summary>
/// Represents the Huddle Agent model.
/// </summary>
public sealed class HuddleAgent : AuditableEntity<int>
{
    public string ExternalId { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? ShortDescription { get; set; }
    public string? WhatItIs { get; set; }
    public string? WhatItHelpsYouDo { get; set; }
    public string? WhenToUseIt { get; set; }

    /// <summary>Situations the agent is not suited to.</summary>
    public string? WhenNotToUseIt { get; set; }

    /// <summary>
    /// Newline-separated steps for getting started with the agent. Rendered as the
    /// "How to practice" block on activity cards.
    /// </summary>
    public string? StepsToGetStarted { get; set; }
    public string? KeyBenefits { get; set; }
    public string? AccessUrl { get; set; }
    public string? AccessLinkLabel { get; set; }
}
