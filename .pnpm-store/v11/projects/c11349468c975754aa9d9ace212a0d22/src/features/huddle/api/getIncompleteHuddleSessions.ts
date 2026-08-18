import type { ApiClient } from "@/api/apiClient";
import { apiEndpoints } from "@/api/endpoints";
import type { IncompleteHuddleSessionResponse } from "../types";

export function getIncompleteHuddleSessions(apiClient: ApiClient) {
  return apiClient.get<IncompleteHuddleSessionResponse[]>(apiEndpoints.huddleSessions.incomplete);
}
