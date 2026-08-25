import type { ApiClient } from "@/api/apiClient";
import { apiEndpoints } from "@/api/endpoints";
import type { IncompleteHuddleSessionResponse } from "../types";

export function getIncompleteHuddleSessions(
  apiClient: ApiClient,
  signal?: AbortSignal,
): Promise<IncompleteHuddleSessionResponse[]> {
  return apiClient.get<IncompleteHuddleSessionResponse[]>(apiEndpoints.huddleSessions.incomplete, signal);
}
