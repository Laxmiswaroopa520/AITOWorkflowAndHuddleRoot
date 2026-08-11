namespace AitoWorkflowAndHuddleGenerator.Contracts.Huddles;

public sealed record HuddleAgentResponse(string ExternalId, string Name, string? ShortDescription, string? WhatItIs, string? WhatItHelpsYouDo, string? WhenToUseIt, IReadOnlyList<string> KeyBenefits, string UsageType, string? DisplayLabel, bool ShowAccessLink, string? AccessUrl, string? AccessLinkLabel, int DisplayOrder, IReadOnlyList<HuddleResourceResponse> Resources);
