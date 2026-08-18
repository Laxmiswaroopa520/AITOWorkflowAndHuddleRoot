import type { ApiClient } from "@/api/apiClient";
import { apiEndpoints } from "@/api/endpoints";
import type { HuddleLaunchPlanResponse, SaveHuddleLaunchPlanRequest } from "../types";

export function saveHuddleLaunchPlan(apiClient: ApiClient, request: SaveHuddleLaunchPlanRequest) {
  return apiClient.put<HuddleLaunchPlanResponse, SaveHuddleLaunchPlanRequest>(apiEndpoints.huddleLaunchPlans.mine, request);
}
