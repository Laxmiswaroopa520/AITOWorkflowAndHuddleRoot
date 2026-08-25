import type { ApiClient } from "@/api/apiClient";
import { apiEndpoints } from "@/api/endpoints";
import type { HuddleDetailResponse } from "../types";

/**
 * Reads one Huddle. Pass placementExternalId to scope phases, activities and the facilitator guide
 * to a single role's appearance of the topic. Without it the API aggregates every role that shares
 * the topic, so a topic on five placements returns fifteen phases.
 */
export function getHuddleById(
  apiClient: ApiClient,
  externalId: string,
  placementExternalId: string | null,
  signal?: AbortSignal,
): Promise<HuddleDetailResponse> {
  const path = apiEndpoints.huddles.byExternalId(externalId);
  const query = placementExternalId
    ? `?placementExternalId=${encodeURIComponent(placementExternalId)}`
    : "";
  return apiClient.get<HuddleDetailResponse>(`${path}${query}`, signal);
}
