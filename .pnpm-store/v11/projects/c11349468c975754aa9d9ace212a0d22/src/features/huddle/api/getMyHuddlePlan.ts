import type { ApiClient } from "@/api/apiClient";
import { apiEndpoints } from "@/api/endpoints";
import type { HuddlePlanResponse } from "../types";

export function getMyHuddlePlan(apiClient: ApiClient, roleExternalId: string, signal?: AbortSignal) {
  const query = new URLSearchParams({ roleExternalId });
  return apiClient.get<HuddlePlanResponse>(`${apiEndpoints.huddlePlans.mine}?${query}`, signal);
}
