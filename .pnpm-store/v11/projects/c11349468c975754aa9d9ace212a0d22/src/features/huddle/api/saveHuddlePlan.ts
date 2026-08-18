import type { ApiClient } from "@/api/apiClient";
import { apiEndpoints } from "@/api/endpoints";
import type { HuddlePlanResponse, SaveHuddlePlanRequest } from "../types";

export function saveHuddlePlan(apiClient: ApiClient, request: SaveHuddlePlanRequest) {
  return apiClient.put<HuddlePlanResponse, SaveHuddlePlanRequest>(apiEndpoints.huddlePlans.mine, request);
}
