import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useApiClient } from "@/api/useApiClient";
import { saveHuddleLaunchPlan } from "../api";
import type { HuddleLaunchPlanResponse, SaveHuddleLaunchPlanRequest } from "../types";
import { huddleQueryKeys } from "./huddleQueryKeys";

export function useSaveHuddleLaunchPlan() {
  const apiClient = useApiClient(); const queryClient = useQueryClient();
  return useMutation<HuddleLaunchPlanResponse, Error, SaveHuddleLaunchPlanRequest>({ mutationFn: request => saveHuddleLaunchPlan(apiClient, request), onSuccess: data => queryClient.setQueryData(huddleQueryKeys.launchPlan(), data) });
}
