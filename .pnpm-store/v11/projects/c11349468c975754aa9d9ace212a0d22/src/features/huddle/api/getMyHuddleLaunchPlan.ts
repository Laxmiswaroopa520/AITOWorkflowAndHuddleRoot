import type { ApiClient } from "@/api/apiClient";
import { apiEndpoints } from "@/api/endpoints";
import type { HuddleLaunchPlanResponse } from "../types";

export async function getMyHuddleLaunchPlan(
  apiClient: ApiClient,
  signal?: AbortSignal,
): Promise<HuddleLaunchPlanResponse | null> {
  const launchPlan = await apiClient.get<HuddleLaunchPlanResponse | null>(
    apiEndpoints.huddleLaunchPlans.mine,
    signal,
  );

  return launchPlan ?? null;
}
