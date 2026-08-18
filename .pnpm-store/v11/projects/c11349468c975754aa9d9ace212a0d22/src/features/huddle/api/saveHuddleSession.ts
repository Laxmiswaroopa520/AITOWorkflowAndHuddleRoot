import type { ApiClient } from "@/api/apiClient";
import { apiEndpoints } from "@/api/endpoints";
import type { HuddleSessionResponse, SaveHuddleSessionRequest } from "../types";

export function saveHuddleSession(apiClient: ApiClient, externalId: string, request: SaveHuddleSessionRequest) {
  return apiClient.put<HuddleSessionResponse, SaveHuddleSessionRequest>(apiEndpoints.huddles.session(externalId), request);
}
