using AitoWorkflowAndHuddleGenerator.Contracts.Huddles;
using MediatR;

namespace AitoWorkflowAndHuddleGenerator.Application.Features.Huddles.Catalog.Queries.GetHuddleCatalog;

/// <summary>
/// Represents the Get Huddle Catalog Query query.
/// </summary>
public sealed record GetHuddleCatalogQuery(
    string? RoleExternalId,
    string? FocusAreaExternalId,
    string? AgentExternalId,
    string? Type,
    string? Search,
    string? Sort,
    /// <summary>
    /// Reports each card's counts as they apply to this role, without filtering the result set.
    /// ActivityCount is keyed on the topic, so it sums every role's version of the topic; a card
    /// that names a placement reports that placement's Featured and Extended split instead.
    /// </summary>
    string? PlacementRoleExternalId = null,
    /// <summary>
    /// When set, returns only the additional content the workbook's Additional_Content sheet defines
    /// for this role, and reports each card against that additional placement. This is what belongs
    /// under Additional Topics; a topic's aligned-roles list does not decide it.
    /// </summary>
    string? AdditionalContentRoleExternalId = null,
    /// <summary>When true, returns additional content for every role rather than one role's.</summary>
    bool AdditionalContentOnly = false,
    /// <summary>
    /// When true, also folds in the Role Path topics for the same audience (every role when
    /// <see cref="AdditionalContentRoleExternalId"/> is null) so All Topics can show both; the
    /// "Only All Topics" filter passes false to show just the additional content.
    /// </summary>
    bool IncludeRolePathTopics = false) : IRequest<IReadOnlyList<HuddleCatalogItemResponse>>;

