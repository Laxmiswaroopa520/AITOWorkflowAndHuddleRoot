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
    public string? KeyBenefits { get; set; }
    public string? AccessUrl { get; set; }
    public string? AccessLinkLabel { get; set; }
}
