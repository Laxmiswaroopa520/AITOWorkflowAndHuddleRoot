using FluentValidation;

namespace AitoWorkflowAndHuddleGenerator.Application.Features.Huddles.Sessions.Queries.GetMyIncompleteHuddleSessions;

/// <summary>
/// Validates Get My Incomplete Huddle Sessions Query requests.
/// </summary>
public sealed class GetMyIncompleteHuddleSessionsQueryValidator : AbstractValidator<GetMyIncompleteHuddleSessionsQuery>;
