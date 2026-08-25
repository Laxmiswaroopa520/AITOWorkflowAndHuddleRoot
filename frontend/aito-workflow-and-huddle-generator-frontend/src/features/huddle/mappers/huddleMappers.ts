import type {
  HuddleCatalogCardViewModel,
  HuddleCatalogItemResponse,
  HuddleMcemStageResponse,
  RecommendedHuddlePathResponse,
  RecommendedHuddleWeekViewModel,
} from "../types";

/**
 * The MCEM stage number lives in the stage's own external ID (MCEM-01..MCEM-05).
 * HuddleTopicMcemStages.DisplayOrder is a global seed row counter (1..44), not a
 * stage number, so it must never be used for this label.
 */
function mcemStageNumber(stage: HuddleMcemStageResponse): number | null {
  const match = /(\d+)\s*$/.exec(stage.externalId);
  return match ? Number(match[1]) : null;
}

/** Formats stages as `MCEM Stage: Manage and Optimize (5)`, joining multiples with ` & `. */
export function formatMcemStageLabel(stages: readonly HuddleMcemStageResponse[]): string | null {
  if (stages.length === 0) return null;
  const parts = [...stages]
    .sort((left, right) => left.externalId.localeCompare(right.externalId))
    .map((stage) => {
      const number = mcemStageNumber(stage);
      return number === null ? stage.name : `${stage.name} (${number})`;
    });
  return `MCEM Stage: ${parts.join(" & ")}`;
}

export function mapHuddleCatalogItemToCard(
  response: HuddleCatalogItemResponse,
): HuddleCatalogCardViewModel {
  return {
    id: response.externalId,
    // A placement's own title and description win. The workbook's Role_Paths sheet gives each week
    // a RoleTopicName and RoleTopicDescription written for that role, and showing the generic topic
    // name instead flattened exactly the role-specific content the path exists to carry: AE week 7
    // is "Inspect Deal Health and Accelerate the Next Decision", not "Advance and Structure the
    // Deal". The topic values remain the fallback for an unscoped card.
    title: response.roleTopicName ?? response.name,
    description: response.roleTopicDescription ?? response.description,
    category: response.type,
    focusArea: response.focusAreaName,
    mcemStageLabel: formatMcemStageLabel(response.mcemStages ?? []),
    // Prefer the placement's own counts. response.activityCount is keyed on the topic, so it sums
    // every role that shares it: WF-X-PIPE-01 sits on three placements and reports 14, while the
    // role actually runs 6. Fall back to the topic count only for genuinely unscoped cards.
    activityCount: response.placementExternalId
      ? (response.featuredActivityCount ?? 0) + (response.extendedActivityCount ?? 0)
      : response.activityCount ?? 0,
    roleTopicName: response.roleTopicName ?? null,
    roleTopicDescription: response.roleTopicDescription ?? null,
    featuredActivityCount: response.featuredActivityCount ?? null,
    extendedActivityCount: response.extendedActivityCount ?? null,
    durationMinutes: response.durationMinutes,
    desiredOutcome: response.desiredOutcome,
    audienceDescription: response.audienceDescription,
    audienceLabel: response.roles.length === 0
      ? "Audience unavailable"
      : response.roles.map((role) => role.abbreviation || role.name).join(", "),
    primaryAgentNames: response.primaryAgents.map((agent) => agent.name),
    secondaryAgentNames: response.secondaryAgents.map((agent) => agent.name),
    primaryAccessUrl: response.primaryAgents.find((agent) => agent.showAccessLink)?.accessUrl ?? null,
    primaryAccessLabel: response.primaryAgents.find((agent) => agent.showAccessLink)?.accessLinkLabel ?? null,
  };
}

export function mapRecommendedPath(
  response: RecommendedHuddlePathResponse,
): RecommendedHuddleWeekViewModel[] {
  return response.items.map((item) => ({
    week: item.week,
    pathOrder: item.pathOrder,
    huddle: mapHuddleCatalogItemToCard(item.huddle),
  }));
}
