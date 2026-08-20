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
    title: response.name,
    description: response.description,
    category: response.type,
    focusArea: response.focusAreaName,
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
    mcemStageLabel: formatMcemStageLabel(response.mcemStages ?? []),
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
