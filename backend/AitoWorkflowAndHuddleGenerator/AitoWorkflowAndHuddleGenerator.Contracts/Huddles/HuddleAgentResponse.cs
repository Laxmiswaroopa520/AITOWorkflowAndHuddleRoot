namespace AitoWorkflowAndHuddleGenerator.Contracts.Huddles;

/// <summary>
/// Represents the Huddle Agent Response API contract.
/// </summary>
public sealed record HuddleAgentResponse(string ExternalId, string Name, string? ShortDescription, string? WhatItIs, string? WhatItHelpsYouDo, string? WhenToUseIt, IReadOnlyList<string> KeyBenefits, string? WhenNotToUseIt, IReadOnlyList<string> StepsToGetStarted, string UsageType, string? DisplayLabel, bool ShowAccessLink, string? AccessUrl, string? AccessLinkLabel, int DisplayOrder, IReadOnlyList<HuddleResourceResponse> Resources);
