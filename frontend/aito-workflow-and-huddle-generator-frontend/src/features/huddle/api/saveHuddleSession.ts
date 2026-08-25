import type { ApiClient } from "@/api/apiClient";
import { apiEndpoints } from "@/api/endpoints";
import type { HuddleSessionResponse, SaveHuddleSessionRequest } from "../types";
import { placementQuery } from "./huddleSessionQuery";

export function saveHuddleSession(
  apiClient: ApiClient,
  externalId: string,
  request: SaveHuddleSessionRequest,
  placementExternalId: string | null = null,
) {
  const path = `${apiEndpoints.huddles.session(externalId)}${placementQuery(placementExternalId)}`;
  return apiClient.put<HuddleSessionResponse, SaveHuddleSessionRequest>(path, request);
}
