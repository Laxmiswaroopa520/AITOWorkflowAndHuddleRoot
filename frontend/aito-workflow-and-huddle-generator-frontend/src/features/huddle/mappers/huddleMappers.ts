import type {
  HuddleCatalogCardViewModel,
  HuddleCatalogItemResponse,
  RecommendedHuddlePathResponse,
  RecommendedHuddleWeekViewModel,
} from "../types";

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
