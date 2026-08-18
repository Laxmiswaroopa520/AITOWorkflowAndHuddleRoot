import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useApiClient } from "@/api/useApiClient";
import { resetHuddleLaunchPlan } from "../api";
import { huddleQueryKeys } from "./huddleQueryKeys";

export function useResetHuddleLaunchPlan() {
  const apiClient = useApiClient(); const queryClient = useQueryClient();
  return useMutation({ mutationFn: () => resetHuddleLaunchPlan(apiClient), onSuccess: () => queryClient.setQueryData(huddleQueryKeys.launchPlan(), null) });
}
