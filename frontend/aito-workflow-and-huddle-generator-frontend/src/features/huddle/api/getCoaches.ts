import { apiEndpoints } from "@/api/endpoints";
import type { ApiClient } from "@/api/apiClient";
import type { CoachResponse } from "../types";

export function getCoaches(apiClient: ApiClient, huddleExternalId: string, signal?: AbortSignal): Promise<CoachResponse[]> {
  return apiClient.get<CoachResponse[]>(`${apiEndpoints.huddleCoaching.coaches}?${new URLSearchParams({ huddleExternalId })}`, signal);
}
