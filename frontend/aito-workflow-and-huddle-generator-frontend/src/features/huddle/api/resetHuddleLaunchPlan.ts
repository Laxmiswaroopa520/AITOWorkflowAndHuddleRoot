import type { ApiClient } from "@/api/apiClient";
import { apiEndpoints } from "@/api/endpoints";

export function resetHuddleLaunchPlan(apiClient: ApiClient) {
  return apiClient.delete(apiEndpoints.huddleLaunchPlans.mine);
}
